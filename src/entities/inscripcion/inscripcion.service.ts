
import { prisma } from "../../config/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../middleware/error.middleware";
import { hoyUTC } from "../../utils/fecha";
import { CreatePersonaTorneo } from "./inscripciones.interface";

class PersonasTorneosService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    // Un body form-encoded manda los ids como texto; validarId es el que despues decide.
    private aEntero(valor: unknown): number {
        return Number(valor);
    }

    // La columna es TIME y Prisma guarda la hora del Date en UTC: pasarle new Date() dejaria
    // la hora corrida tres horas en Argentina. Se arma la hora local sobre la epoch.
    private horaActual(): Date {
        const ahora = new Date();
        return new Date(Date.UTC(
            1970, 0, 1,
            ahora.getHours(), ahora.getMinutes(), ahora.getSeconds()
        ));
    }

    // Valida que el torneo y la persona existan, que el torneo no haya empezado, que quede
    // cupo y que la persona no tenga otro torneo que se superponga con este.
    private async validarTorneo(
        db: Prisma.TransactionClient,
        idTorneo: number,
        idPers: number
    ) {
        const [torneo, persona] = await Promise.all([
            db.torneos.findUnique({ where: { idTorneos: idTorneo } }),
            db.personas.findUnique({ where: { idPersona: idPers } })
        ]);

        if (!torneo) throw new AppError("El torneo ingresado no existe", 404);
        if (!persona) throw new AppError("La persona ingresada no existe", 404);

        if (torneo.fechaInicio < hoyUTC()) {
            throw new Error("El torneo ya comenzó: no se admiten inscripciones");
        }

        const cantidadInscripciones = await db.personas_torneos.count({
            where: { Torneos_idTorneos: idTorneo }
        });

        if (cantidadInscripciones >= torneo.cupoMaximo) {
            throw new Error("El torneo alcanzó el cupo máximo de inscripciones");
        }

        // Dos torneos se pisan si cada uno empieza antes de que el otro termine. Comparar
        // solo la fecha de inicio dejaba pasar un torneo que arranca en medio de otro.
        const solapada = await db.personas_torneos.findFirst({
            where: {
                Personas_idPersona: idPers,
                torneos: {
                    fechaInicio: { lte: torneo.fechaFin },
                    fechaFin: { gte: torneo.fechaInicio }
                }
            },
            include: { torneos: true }
        });

        if (solapada) {
            throw new Error(
                `La persona ya está inscripta en ${solapada.torneos.nombre}, que se superpone con este torneo`
            );
        }
    }

    async getAll() {
        return await prisma.personas_torneos.findMany();
    }

    // restringirAPersona: cuando viene, la operacion queda limitada a las inscripciones de
    // esa persona. El controller lo manda para un CLIENTE y lo omite para EMPLEADO y ADMIN.
    // Vive en el service para que ningun caller nuevo pueda saltearlo.
    async getById(
        Torneos_idTorneos: number,
        Personas_idPersona: number,
        restringirAPersona?: number
    ) {
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);
        // 404 y no 403: a un cliente no le decimos quien mas esta inscripto
        if (restringirAPersona !== undefined && Personas_idPersona !== restringirAPersona) {
            return null;
        }
        return await prisma.personas_torneos.findUnique({
            where: {
                Torneos_idTorneos_Personas_idPersona: {
                    Torneos_idTorneos,
                    Personas_idPersona
                }
            }
        });
    }

    // Las inscripciones de una persona. Es lo que consume GET /api/inscripciones/mias, para
    // que un cliente vea en que torneos esta anotado sin poder listar las de todos.
    async getPorPersona(Personas_idPersona: number) {
        this.validarId(Personas_idPersona);
        return await prisma.personas_torneos.findMany({
            where: { Personas_idPersona },
            include: { torneos: true },
            orderBy: { torneos: { fechaInicio: "asc" } }
        });
    }

    async create(data: CreatePersonaTorneo, restringirAPersona?: number) {
        // Un CLIENTE no elige a nombre de quien se inscribe: se le impone su propio id.
        const Personas_idPersona = restringirAPersona ?? this.aEntero(data.Personas_idPersona);
        const Torneos_idTorneos = this.aEntero(data.Torneos_idTorneos);
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);

        return await prisma.$transaction(async (db) => {
            // Sin el lock, dos inscripciones simultaneas leen el mismo cupo libre y entran
            // las dos. Bloquear la fila del torneo serializa las inscripciones a ese torneo.
            await db.$queryRaw`SELECT idTorneos FROM torneos WHERE idTorneos = ${Torneos_idTorneos} FOR UPDATE`;
            await this.validarTorneo(db, Torneos_idTorneos, Personas_idPersona);

            // La fecha y la hora salen del reloj del servidor, nunca de la request.
            return await db.personas_torneos.create({
                data: {
                    fecha_inscripcion: hoyUTC(),
                    hora_inscripcion: this.horaActual(),
                    torneos: { connect: { idTorneos: Torneos_idTorneos } },
                    personas: { connect: { idPersona: Personas_idPersona } }
                }
            });
        });
    }

    async delete(
        Torneos_idTorneos: number,
        Personas_idPersona: number,
        restringirAPersona?: number
    ) {
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);

        if (restringirAPersona !== undefined) {
            if (Personas_idPersona !== restringirAPersona) {
                throw new AppError("No podés dar de baja la inscripción de otra persona", 403);
            }
            // Con el torneo empezado la baja la hace un ADMIN: ya puede haber carreras
            // corridas y participaciones cargadas.
            const torneo = await prisma.torneos.findUnique({
                where: { idTorneos: Torneos_idTorneos }
            });
            if (torneo && torneo.fechaInicio < hoyUTC()) {
                throw new AppError(
                    "El torneo ya comenzó: la baja la tiene que hacer un administrador", 400
                );
            }
        }

        return await prisma.personas_torneos.delete({
            where: {
                Torneos_idTorneos_Personas_idPersona: {
                    Torneos_idTorneos,
                    Personas_idPersona
                }
            }
        });
    }
}

export default new PersonasTorneosService();
