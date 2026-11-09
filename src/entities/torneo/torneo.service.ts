import { validarId } from "../../utils/validar";
import { AppError } from "../../middleware/error.middleware";
import {prisma} from "../../config/prisma";
import { CreateTorneos, ITorneos, UpdateTorneos } from "./torneo.interface";
import { hoyUTC } from "../../utils/fecha";
import { Prisma } from "../../generated/prisma/client";
import { opcionesTxBloqueo } from "../../utils/ocupacion";

const ESTADOS = ["proximo", "en_curso", "finalizado"] as const;
type EstadoTorneo = typeof ESTADOS[number];

class TorneosService {

    private validarDatos(data: Partial<Omit<ITorneos, "idTorneos">>) {
        if (data.nombre !== undefined &&
            (typeof data.nombre !== "string" ||
                data.nombre.trim().length === 0 ||
                data.nombre.trim().length > 45)) {
            throw new AppError("El nombre debe ser un texto de entre 1 y 45 caracteres");
        }

        if (data.descripcion !== undefined &&
            (typeof data.descripcion !== "string" ||
                data.descripcion.trim().length === 0 ||
                data.descripcion.trim().length > 45)) {
            throw new AppError("La descripción debe ser un texto de entre 1 y 45 caracteres");
        }

        if (data.cupoMaximo !== undefined &&
            (!Number.isInteger(data.cupoMaximo) || data.cupoMaximo <= 0)) {
            throw new AppError("El cupo máximo debe ser un número entero mayor que cero");
        }

        if (data.TiposLicencias_idTipoLicencia !== undefined &&
            !Number.isInteger(data.TiposLicencias_idTipoLicencia)) {
            throw new AppError("El tipo de licencia debe ser un identificador entero");
        }

        if (data.fechaInicio !== undefined && isNaN(data.fechaInicio.getTime())) {
            throw new AppError("La fecha de inicio no es válida");
        }

        if (data.fechaFin !== undefined && isNaN(data.fechaFin.getTime())) {
            throw new AppError("La fecha de fin no es válida");
        }

        if (data.fechaInicio !== undefined && data.fechaFin !== undefined &&
            data.fechaInicio >= data.fechaFin) {
            throw new AppError("La fecha de inicio debe ser anterior a la fecha de fin");
        }
    }

    private async validarLicenciaExiste(idTipoLicencia: number) {
        const licencia = await prisma.tiposlicencias.findUnique({ where: { idTipoLicencia } });
        if (!licencia) throw new AppError("El tipo de licencia ingresado no existe");
    }

    // calcula el estado con la fecha de hoy
    private conEstado<T extends { fechaInicio: Date; fechaFin: Date }>(torneo: T) {
        const hoy = hoyUTC();
        const estado: EstadoTorneo = torneo.fechaFin < hoy ? "finalizado"
            : torneo.fechaInicio > hoy ? "proximo"
            : "en_curso";
        return { ...torneo, estado };
    }
    // construye el filtro para prisma 
    private filtroEstado(estado: string) {
        const hoy = hoyUTC();
        switch (estado) {
            case "proximo": return { fechaInicio: { gt: hoy } };
            case "finalizado": return { fechaFin: { lt: hoy } };
            case "en_curso": return { fechaInicio: { lte: hoy }, fechaFin: { gte: hoy } };
            default: throw new AppError(`El estado debe ser uno de: ${ESTADOS.join(", ")}`);
        }
    }

    // lo que ya esta armado (inscriptos y carreras) tiene que seguir entrando en el torneo editado
    private async validarContraLoArmado(
        db: Prisma.TransactionClient,
        idTorneo: number,
        cambios: { cupoMaximo?: number; fechaInicio: Date; fechaFin: Date }
    ) {
        const carreras = await db.carreras.findMany({
            where: { Torneos_idTorneos: idTorneo },
            select: { fechaCarrera: true, Circuitos_idCircuitos: true, _count: { select: { kartings: true } } }
        });
        const fuera = carreras.find(c => c.fechaCarrera < cambios.fechaInicio || c.fechaCarrera > cambios.fechaFin);
        if (fuera) {
            throw new AppError(`La carrera del ${fuera.fechaCarrera.toISOString().slice(0, 10)} quedaría fuera de las fechas del torneo`);
        }

        const cupo = cambios.cupoMaximo;
        if (cupo === undefined) return;
        const inscriptos = await db.personas_torneos.count({ where: { Torneos_idTorneos: idTorneo } });
        if (cupo < inscriptos) {
            throw new AppError(`El cupo no puede ser menor que los ${inscriptos} inscriptos actuales`);
        }
        // carrera.service exige un kart por piloto del cupo
        const cortas = carreras.filter(c => c._count.kartings < cupo);
        if (cortas.length > 0) {
            throw new AppError(`Hay ${cortas.length} carrera(s) con menos de ${cupo} kartings asignados`);
        }
        const ids = [...new Set(carreras.map(c => c.Circuitos_idCircuitos))];
        if (ids.length === 0) return;
        // compartido: si a la vez alguien baja el maximo de uno de estos circuitos (FOR UPDATE), uno espera al otro
        const circuitos = await db.$queryRaw<{ idCircuitos: number; maximo: number }[]>`SELECT idCircuitos, maximo FROM circuitos WHERE idCircuitos IN (${Prisma.join(ids)}) LOCK IN SHARE MODE`;
        const chico = circuitos.find(c => c.maximo < cupo);
        if (chico) {
            throw new AppError(`El circuito ${chico.idCircuitos} admite ${chico.maximo} kartings, menos que el cupo ${cupo}`);
        }
    }

    async getAll(estado?: string, idTipoLicencia?: number) {
        if (idTipoLicencia !== undefined && !Number.isInteger(idTipoLicencia)) {
            throw new AppError("El tipo de licencia debe ser un número entero");
        }
        const torneos = await prisma.torneos.findMany({
            where: {
                ...(estado !== undefined && this.filtroEstado(estado)),
                ...(idTipoLicencia !== undefined && { TiposLicencias_idTipoLicencia: idTipoLicencia })
            },
            include: { tiposlicencias: true },
            orderBy: { fechaInicio: "asc" }
        });
        return torneos.map(t => this.conEstado(t));
    }

    async getById(idTorneo: number) {
        validarId(idTorneo);
        const torneo = await prisma.torneos.findUnique({
            where: { idTorneos: idTorneo }
        });
        return torneo && this.conEstado(torneo);
    }

    async create(data: CreateTorneos) {
        const datos = {...data, fechaInicio: new Date(data.fechaInicio), fechaFin: new Date(data.fechaFin)};
        this.validarDatos(datos);
        await this.validarLicenciaExiste(datos.TiposLicencias_idTipoLicencia);
        return await prisma.torneos.create({
            data: {...datos, nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim()}
        });
    }

   
async update(idTorneo: number, data: UpdateTorneos) {
    validarId(idTorneo);

    // Construimos solo los campos permitidos y convertimos las fechas recibidas.
    const datos = {
        ...(data.nombre !== undefined && {
            nombre: data.nombre
        }),
        ...(data.descripcion !== undefined && {
            descripcion: data.descripcion
        }),
        ...(data.fechaInicio !== undefined && {
            fechaInicio: new Date(data.fechaInicio)
        }),
        ...(data.fechaFin !== undefined && {
            fechaFin: new Date(data.fechaFin)
        }),
        ...(data.TiposLicencias_idTipoLicencia !== undefined && {
            TiposLicencias_idTipoLicencia: data.TiposLicencias_idTipoLicencia
        }),
        ...(data.cupoMaximo !== undefined && {
            cupoMaximo: data.cupoMaximo
        })
    };

    this.validarDatos(datos);

    return await prisma.$transaction(async (db) => {
        // el mismo candado que toman las inscripciones y (compartido) las carreras:
        // mientras se valida no entra un inscripto ni una carrera nueva
        await db.$queryRaw`SELECT idTorneos FROM torneos WHERE idTorneos = ${idTorneo} FOR UPDATE`;
        const actual = await db.torneos.findUnique({
            where: { idTorneos: idTorneo }
        });

        if (!actual) {
            throw new AppError("El torneo indicado no existe", 404);
        }

        const inicio = datos.fechaInicio ?? actual.fechaInicio;
        const fin = datos.fechaFin ?? actual.fechaFin;

        if (inicio >= fin) {
            throw new AppError(
                "La fecha de inicio debe ser anterior a la fecha de fin"
            );
        }

        // Cambiar la licencia dejaría a las carreras ya armadas con karts de otra licencia.
        if (
            datos.TiposLicencias_idTipoLicencia !== undefined &&
            datos.TiposLicencias_idTipoLicencia !== actual.TiposLicencias_idTipoLicencia
        ) {
            await this.validarLicenciaExiste(
                datos.TiposLicencias_idTipoLicencia
            );

            if (
                await db.carreras.count({
                    where: { Torneos_idTorneos: idTorneo }
                }) > 0
            ) {
                throw new AppError(
                    "No se puede cambiar el tipo de licencia: el torneo ya tiene carreras"
                );
            }
        }

        if (datos.cupoMaximo !== undefined || datos.fechaInicio !== undefined || datos.fechaFin !== undefined) {
            await this.validarContraLoArmado(db, idTorneo, { cupoMaximo: datos.cupoMaximo, fechaInicio: inicio, fechaFin: fin });
        }

        return await db.torneos.update({
            where: { idTorneos: idTorneo },
            data: datos
            });
    }, opcionesTxBloqueo);
    }
    


    async delete(idTorneo: number) {
        validarId(idTorneo);
        return await prisma.torneos.delete({
            where: { idTorneos: idTorneo }
        });
    }

}

export default new TorneosService();
