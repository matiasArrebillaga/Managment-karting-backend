
import { prisma } from "../../config/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../middleware/error.middleware";
import { hoyUTC } from "../../utils/fecha";
import { CreatePersonaTorneo } from "./inscripciones.interface";

class PersonasTorneosService {
    // valida que el id sea entero como en los otros service importantes
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private aEntero(valor: unknown): number {
        return Number(valor);
    }
    // da la hora actual
    private horaActual(): Date {
        const ahora = new Date();
        return new Date(Date.UTC(
            1970, 0, 1,
            ahora.getHours(), ahora.getMinutes(), ahora.getSeconds()
        ));
    }
    //valida que el torneo exista, no haya empezado y tenga cupo
    private async validarTorneo(
        db: Prisma.TransactionClient,
        idTorneo: number,
        idPers: number
    ) {
        const [torneo, persona] = await Promise.all([ // calida que el torneo y la persona existan
            db.torneos.findUnique({ where: { idTorneos: idTorneo } }),
            db.personas.findUnique({ where: { idPersona: idPers } })
        ]);

        if (!torneo) throw new AppError("El torneo ingresado no existe", 404);
        if (!persona) throw new AppError("La persona ingresada no existe", 404);

        if (torneo.fechaInicio < hoyUTC()) { // que el torneo no haya empezado
            throw new Error("El torneo ya comenzó: no se admiten inscripciones");
        }

        const cantidadInscripciones = await db.personas_torneos.count({ // que haya cupo
            where: { Torneos_idTorneos: idTorneo }
        });

        if (cantidadInscripciones >= torneo.cupoMaximo) {
            throw new Error("El torneo alcanzó el cupo máximo de inscripciones");
        }

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


    async getById(
        Torneos_idTorneos: number,
        Personas_idPersona: number,
        restringirAPersona?: number
    ) {
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);

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
    // lista las inscripciones de una persona
    async getPorPersona(Personas_idPersona: number) {
        this.validarId(Personas_idPersona);
        return await prisma.personas_torneos.findMany({
            where: { Personas_idPersona },
            include: { torneos: true },
            orderBy: { torneos: { fechaInicio: "asc" } }
        });
    }

    async create(data: CreatePersonaTorneo, restringirAPersona?: number) {
        // valida los id, restringir persona hace que un cliente se inscriba a si mismo (ADMIN podria inscribir a otra persona)
        const Personas_idPersona = restringirAPersona ?? this.aEntero(data.Personas_idPersona);
        const Torneos_idTorneos = this.aEntero(data.Torneos_idTorneos);
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);
        // comienza la transaccion, previene overbooking si queda un solo cupo
        return await prisma.$transaction(async (db) => {
            await db.$queryRaw`SELECT idTorneos FROM torneos WHERE idTorneos = ${Torneos_idTorneos} FOR UPDATE`;
            await this.validarTorneo(db, Torneos_idTorneos, Personas_idPersona);
            
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
        // solo podes borrar tu inscripcion igual que create
        if (restringirAPersona !== undefined) {
            if (Personas_idPersona !== restringirAPersona) {
                throw new AppError("No podés dar de baja la inscripción de otra persona", 403);
            }

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
