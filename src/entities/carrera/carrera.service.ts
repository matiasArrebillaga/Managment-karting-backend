import { validarId } from "../../utils/validar";
import {prisma} from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { CreateCarrera, UpdateCarrera } from "../carrera/carrera.interface";
import { normalizarFecha, normalizarHora } from "../../utils/fecha";
import { bloquearFranja, franjaOcupada, opcionesTxBloqueo } from "../../utils/ocupacion";
import { AppError } from "../../middleware/error.middleware";

// trae los karts asignados de cada carrera
const conKartings = { kartings: { include: { kartings: true } } } as const;

const MS_POR_HORA = 60 * 60 * 1000;

type CarreraConKartings = Prisma.carrerasGetPayload<{ include: typeof conKartings }>;

class CarrerasService {
    private validarClaves(...ids: number[]) {
        ids.forEach(id => validarId(id));
    }

    // clave de la carrera, fecha a medianoche utc como el DATE
    private clave(fechaCarrera: Date, Torneos_idTorneos: number, Circuitos_idCircuitos: number) {
        this.validarClaves(Torneos_idTorneos, Circuitos_idCircuitos);
        return {
            Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                Torneos_idTorneos,
                Circuitos_idCircuitos,
                fechaCarrera: normalizarFecha(fechaCarrera)
            }
        };
    }

    // los karts como lista y no como tabla intermedia
    private aplanar(carrera: CarreraConKartings) {
        return { ...carrera, kartings: carrera.kartings.map(k => k.kartings) };
    }

    private validarKartings(kartings: unknown): number[] {
        if (!Array.isArray(kartings) || kartings.length === 0) {
            throw new AppError("La carrera debe tener al menos un karting");
        }
        kartings.forEach(id => validarId(id));
        if (new Set(kartings).size !== kartings.length) {
            throw new AppError("Hay kartings repetidos en la carrera");
        }
        return kartings;
    }

    private validarHorarios(horaInicio: Date, horaFin: Date) {
        if (isNaN(horaInicio.getTime()) || isNaN(horaFin.getTime())) {
            throw new AppError("Las horas de inicio y fin no son validas");
        }
        if (horaInicio >= horaFin) {
            throw new AppError("La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    // solo valida las horas que se mandan
    private validarEnPunto(...horas: Date[]) {
        // las horas se guardan como 1970-01-01 utc, en punto = multiplo de una hora
        if (horas.some(hora => hora.getTime() % MS_POR_HORA !== 0)) {
            throw new AppError("Las carreras son en hora en punto (ej: 10:00 a 12:00)");
        }
    }

    // lock compartido: las carreras no se esperan entre si, editar el torneo si
    private async bloquearTorneo(db: Prisma.TransactionClient, idTorneo: number) {
        await db.$queryRaw`SELECT idTorneos FROM torneos WHERE idTorneos = ${idTorneo} LOCK IN SHARE MODE`;
    }

    private async validarEntidadesRelacionadas(db: Prisma.TransactionClient, Torneos_idTorneos: number, Circuitos_idCircuitos: number) {
        const [torneo, circuito] = await Promise.all([
            db.torneos.findUnique({ where: { idTorneos: Torneos_idTorneos } }),
            db.circuitos.findUnique({ where: { idCircuitos: Circuitos_idCircuitos } })
        ]);
        if (!torneo) throw new AppError("El torneo indicado no existe");
        if (!circuito) throw new AppError("El circuito indicado no existe");
        if (circuito.maximo < torneo.cupoMaximo) {
            throw new AppError("El circuito no tiene capacidad suficiente para el cupo máximo del torneo");
        }
        return { torneo, circuito };
    }

    private validarFechaDentroDelTorneo(fechaCarrera: Date, torneo: { fechaInicio: Date; fechaFin: Date }) {
        if (fechaCarrera < torneo.fechaInicio || fechaCarrera > torneo.fechaFin) {
            throw new AppError("La fecha de la carrera está fuera del rango del torneo");
        }
    }

    // un kart por piloto, de la licencia del torneo
    private async validarKartingsDelTorneo(
        db: Prisma.TransactionClient,
        kartings: number[],
        torneo: { cupoMaximo: number; TiposLicencias_idTipoLicencia: number }
    ) {
        if (kartings.length < torneo.cupoMaximo) {
            throw new AppError(`La carrera necesita al menos ${torneo.cupoMaximo} kartings (cupo máximo del torneo); se asignaron ${kartings.length}`);
        }
        const conLicencia = await db.kartings.findMany({
            where: { idKartings: { in: kartings } },
            include: { tiposkarting: true }
        });
        const deOtraLicencia = conLicencia
            .filter(k => k.tiposkarting.TiposLicencias_idTipoLicenciaMinima !== torneo.TiposLicencias_idTipoLicencia)
            .map(k => k.idKartings);
        if (deOtraLicencia.length > 0) {
            throw new AppError(`Los kartings ${deOtraLicencia.join(", ")} no son del tipo de licencia del torneo`);
        }
    }

    // valida que los karts existan, esten libres y entren en el circuito
    // el estado solo se exige a karts nuevos
    private async validarAsignacion(
        db: Prisma.TransactionClient,
        kartings: number[],
        circuito: { idCircuitos: number; maximo: number },
        fechaCarrera: Date,
        horaInicio: Date,
        horaFin: Date,
        opciones: { exigirDisponibles: boolean; excluir?: { Torneos_idTorneos: number; Circuitos_idCircuitos: number } }
    ) {
        const encontrados = await db.kartings.findMany({ where: { idKartings: { in: kartings } } });
        const faltantes = kartings.filter(id => !encontrados.some(k => k.idKartings === id));
        if (faltantes.length > 0) throw new AppError(`Los kartings ${faltantes.join(", ")} no existen`);

        if (opciones.exigirDisponibles) {
            const noDisponibles = encontrados.filter(k => k.estado?.toLowerCase() !== "disponible");
            if (noDisponibles.length > 0) {
                throw new AppError(`Los kartings ${noDisponibles.map(k => k.idKartings).join(", ")} no estan disponibles`);
            }
        }

        const ocupadas = await franjaOcupada(db, fechaCarrera, horaInicio, horaFin, { carrera: opciones.excluir });
        const enUso = kartings.filter(id => ocupadas.some(o => o.Kartings_idKartings === id));
        if (enUso.length > 0) {
            throw new AppError(`Los kartings ${enUso.join(", ")} ya estan asignados en ese horario`);
        }
        const enElCircuito = ocupadas.filter(o => o.Circuitos_idCircuitos === circuito.idCircuitos).length;
        if (enElCircuito + kartings.length > circuito.maximo) {
            throw new AppError("El circuito no tiene lugar para todos los kartings en ese horario");
        }
    }

    async getAll() {
        const carreras = await prisma.carreras.findMany({ include: conKartings });
        return carreras.map(c => this.aplanar(c));
    }

    async getById(fechaCarrera: Date, Torneos_idTorneos: number, Circuitos_idCircuitos: number) {
        const carrera = await prisma.carreras.findUnique({
            where: this.clave(fechaCarrera, Torneos_idTorneos, Circuitos_idCircuitos),
            include: conKartings
        });
        if (!carrera) throw new AppError("La carrera indicada no existe", 404);
        return this.aplanar(carrera);
    }

    // kartings reemplaza la lista completa
    async update(
        fechaCarrera: Date,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number,
        data: UpdateCarrera
    ) {
        const where = this.clave(fechaCarrera, Torneos_idTorneos, Circuitos_idCircuitos);
        const fecha = where.Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera.fechaCarrera;
        const nuevosKartings = data.kartings === undefined ? undefined : this.validarKartings(data.kartings);
        const horas = {
            ...(data.horaInicio !== undefined && { horaInicio: normalizarHora(data.horaInicio, "horaInicio") }),
            ...(data.horaFin !== undefined && { horaFin: normalizarHora(data.horaFin, "horaFin") })
        };
        this.validarEnPunto(...Object.values(horas));

        return await prisma.$transaction(async (db) => {
            // bloquea la carrera primero asi sus karts no cambian mientras se validan
            await db.$queryRaw`SELECT 1 FROM carreras WHERE Torneos_idTorneos = ${Torneos_idTorneos} AND Circuitos_idCircuitos = ${Circuitos_idCircuitos} AND fechaCarrera = ${fecha.toISOString().slice(0, 10)} FOR UPDATE`;
            const actual = await db.carreras.findUnique({ where, include: conKartings });
            if (!actual) throw new AppError("La carrera indicada no existe", 404);

            if (horas.horaInicio !== undefined || horas.horaFin !== undefined || nuevosKartings !== undefined) {
                const kartings = nuevosKartings ?? actual.kartings.map(k => k.Kartings_idKartings);
                await bloquearFranja(db, kartings, Circuitos_idCircuitos, fecha);
                const horaInicio = horas.horaInicio ?? actual.horaInicio;
                const horaFin = horas.horaFin ?? actual.horaFin;
                this.validarHorarios(horaInicio, horaFin);
                const circuito = await db.circuitos.findUnique({ where: { idCircuitos: Circuitos_idCircuitos } });
                if (!circuito) throw new AppError("El circuito indicado no existe");
                // se excluye a si misma del control de solape
                await this.validarAsignacion(
                    db, kartings, circuito,
                    fecha, horaInicio, horaFin,
                    { exigirDisponibles: nuevosKartings !== undefined, excluir: { Torneos_idTorneos, Circuitos_idCircuitos } }
                );
            }
            // solo si cambian los karts
            if (nuevosKartings !== undefined) {
                await this.bloquearTorneo(db, Torneos_idTorneos);
                const torneo = await db.torneos.findUnique({ where: { idTorneos: Torneos_idTorneos } });
                if (!torneo) throw new AppError("El torneo indicado no existe");
                await this.validarKartingsDelTorneo(db, nuevosKartings, torneo);
            }

            const actualizada = await db.carreras.update({
                where,
                data: {
                    ...horas,
                    ...(nuevosKartings !== undefined && {
                        kartings: {
                            deleteMany: {},
                            create: nuevosKartings.map(id => ({ Kartings_idKartings: id }))
                        }
                    })
                },
                include: conKartings
            });
            return this.aplanar(actualizada);
        }, opcionesTxBloqueo);
    }

    // sus karts se borran en cascada
    async delete(fechaCarrera: Date, Torneos_idTorneos: number, Circuitos_idCircuitos: number) {
        await this.getById(fechaCarrera, Torneos_idTorneos, Circuitos_idCircuitos);
        return await prisma.carreras.delete({
            where: this.clave(fechaCarrera, Torneos_idTorneos, Circuitos_idCircuitos)
        });
    }

    async crearCarrera(data: CreateCarrera) {
        this.validarClaves(data.Torneos_idTorneos, data.Circuitos_idCircuitos);
        const kartings = this.validarKartings(data.kartings);
        const fechaCarrera = normalizarFecha(data.fechaCarrera);
        const horaInicio = normalizarHora(data.horaInicio, "horaInicio");
        const horaFin = normalizarHora(data.horaFin, "horaFin");
        this.validarHorarios(horaInicio, horaFin);
        this.validarEnPunto(horaInicio, horaFin);

        return await prisma.$transaction(async (db) => {
            // antes de leer, asi ve lo ultimo confirmado
            await bloquearFranja(db, kartings, data.Circuitos_idCircuitos, fechaCarrera);
            await this.bloquearTorneo(db, data.Torneos_idTorneos);
            const { torneo, circuito } = await this.validarEntidadesRelacionadas(
                db, data.Torneos_idTorneos, data.Circuitos_idCircuitos
            );
            this.validarFechaDentroDelTorneo(fechaCarrera, torneo);
            await this.validarAsignacion(db, kartings, circuito, fechaCarrera, horaInicio, horaFin, { exigirDisponibles: true });
            await this.validarKartingsDelTorneo(db, kartings, torneo);

            const carrera = await db.carreras.create({
                data: {
                    fechaCarrera,
                    horaInicio,
                    horaFin,
                    torneos: { connect: { idTorneos: data.Torneos_idTorneos } },
                    circuitos: { connect: { idCircuitos: data.Circuitos_idCircuitos } },
                    kartings: { create: kartings.map(id => ({ Kartings_idKartings: id })) }
                },
                include: conKartings
            });
            return this.aplanar(carrera);
        }, opcionesTxBloqueo);
    }

    async getByTorneo(idTorneo: number) {
        validarId(idTorneo);
        const carreras = await prisma.carreras.findMany({
            where: { Torneos_idTorneos: idTorneo },
            include: { circuitos: true, ...conKartings },
            orderBy: { fechaCarrera: "asc" }
        });
        return carreras.map(c => ({ ...c, kartings: c.kartings.map(k => k.kartings) }));
    }
}

export default new CarrerasService();
