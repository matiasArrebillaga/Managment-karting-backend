
import {prisma} from "../../config/prisma.js";
import {
    CreatePersonaTorneo,
    UpdatePersonaTorneo
} from "./inscripciones.interface.js";

class PersonasTorneosService {

    async getAll() {
        return await prisma.personas_torneos.findMany();
    }

    async getById(
        Torneos_idTorneos: number,
        Personas_idPersona: number
    ) {
        return await prisma.personas_torneos.findUnique({
            where: {
                Torneos_idTorneos_Personas_idPersona: {
                    Torneos_idTorneos,
                    Personas_idPersona
                }
            }
        });
    }

    async create(data: CreatePersonaTorneo) {
        return await prisma.personas_torneos.create({
            data: {
                fecha_inscipcion: data.fecha_inscipcion,
                hora_inscripcion: data.hora_inscripcion,

                torneos: {
                    connect: {
                        idTorneos: data.Torneos_idTorneos
                    }
                },

                personas: {
                    connect: {
                        idPersona: data.Personas_idPersona
                    }
                }
            }
        });
    }

    async update(
        Torneos_idTorneos: number,
        Personas_idPersona: number,
        data: UpdatePersonaTorneo
    ) {
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
