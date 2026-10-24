import { AppError } from "../../middleware/error.middleware";
import {prisma} from "../../config/prisma.js";
import { CreateTorneos, ITorneos, UpdateTorneos } from "./torneo.interface.js";
import { hoyUTC } from "../../utils/fecha.js";

const ESTADOS = ["proximo", "en_curso", "finalizado"] as const;
type EstadoTorneo = typeof ESTADOS[number];

class TorneosService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new AppError("El identificador debe ser un número entero");
    }

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
        this.validarId(idTorneo);
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
    this.validarId(idTorneo);

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
        })
    };

    this.validarDatos(datos);

    const actual = await prisma.torneos.findUnique({
        where: { idTorneos: idTorneo }
    });

    if (!actual) {
        throw new AppError("El torneo indicado no existe");
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
            await prisma.carreras.count({
                where: { Torneos_idTorneos: idTorneo }
            }) > 0
        ) {
            throw new AppError(
                "No se puede cambiar el tipo de licencia: el torneo ya tiene carreras"
            );
        }
    }

    return await prisma.torneos.update({
        where: { idTorneos: idTorneo },
        data: datos
        });
    }
    


    async delete(idTorneo: number) {
        this.validarId(idTorneo);
        return await prisma.torneos.delete({
            where: { idTorneos: idTorneo }
        });
    }

}

export default new TorneosService();
