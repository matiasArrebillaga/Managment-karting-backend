
import {prisma} from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import {
    CreatePersonaTorneo,
    UpdatePersonaTorneo
} from "./inscripciones.interface.js";

class PersonasTorneosService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarFecha(fecha: Date, nombre: string, noFutura = false) {
        if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) throw new Error(`La ${nombre} no es válida`);
        if (noFutura && fecha > new Date()) throw new Error(`La ${nombre} no puede ser futura`);
    }
    private validarDatos(data: CreatePersonaTorneo | UpdatePersonaTorneo) {
        if (data.fecha_inscipcion !== undefined) this.validarFecha(data.fecha_inscipcion, "fecha de inscripción", true);
        if (data.hora_inscripcion !== undefined) this.validarFecha(data.hora_inscripcion, "hora de inscripción");
    }

    async getAll() {
        return await prisma.personas_torneos.findMany();
    }

    async getById(
        Torneos_idTorneos: number,
        Personas_idPersona: number
    ) {
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);
        return await prisma.personas_torneos.findUnique({
            where: {
                Torneos_idTorneos_Personas_idPersona: {
                    Torneos_idTorneos,
                    Personas_idPersona
                }
            }
        });
    }

//Aca lo que estoy validando es que el torneo exista y que la persona no pueda anotarse a un torneo el mismo dia

   private async validarTorneo(idTorneo: number, idPers: number) {
    const torneo = await prisma.torneos.findUnique({
        where: {
            idTorneos: idTorneo
        }
    });

    if (!torneo) {
        throw new Error("El torneo ingresado no existe");
    }

    const persona = await prisma.personas.findUnique({
        where: { idPersona: idPers }
    });

    if (!persona) {
        throw new Error("La persona ingresada no existe");
    }

    const cantidadInscripciones = await prisma.personas_torneos.count({
        where: { Torneos_idTorneos: idTorneo }
    });

    if (cantidadInscripciones >= torneo.cupoMaximo) {
        throw new Error("El torneo alcanzó el cupo máximo de inscripciones");
    }

    const inscripciones: Prisma.personas_torneosGetPayload<{
        include: { torneos: true };
    }>[] = await prisma.personas_torneos.findMany({
        where: {
            Personas_idPersona: idPers
        },
        include: {
            torneos: true
        }
    });

    const mismoDia = inscripciones.some(inscripcion => {
        return (
            inscripcion.torneos.fechaInicio.toDateString() ===
            torneo.fechaInicio.toDateString()
        );
    });

    if (mismoDia) {
        throw new Error(
            "La persona ya está inscripta en otro torneo el mismo día"
        );
    }
}

    async create(data: CreatePersonaTorneo) {
        this.validarId(data.Torneos_idTorneos);
        this.validarId(data.Personas_idPersona);
        this.validarDatos(data);
        await this.validarTorneo(
            data.Torneos_idTorneos,
            data.Personas_idPersona
        );

        return await prisma.personas_torneos.create({
            data: {
                fecha_inscipcion: data.fecha_inscipcion,
                hora_inscripcion: data.hora_inscripcion,
                torneos: {
                    connect: { idTorneos: data.Torneos_idTorneos }
                },
                personas: {
                    connect: { idPersona: data.Personas_idPersona }
                }
            }
        });
    }

    

    async update(
        Torneos_idTorneos: number,
        Personas_idPersona: number,
        data: UpdatePersonaTorneo
    ) {
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);
        this.validarDatos(data);
        return await prisma.personas_torneos.update({
            where: {
                Torneos_idTorneos_Personas_idPersona: {
                    Torneos_idTorneos,
                    Personas_idPersona
                }
            },
            data
        });
    }

    async delete(
        Torneos_idTorneos: number,
        Personas_idPersona: number
    ) {
        this.validarId(Torneos_idTorneos);
        this.validarId(Personas_idPersona);
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
