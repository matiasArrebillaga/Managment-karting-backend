
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

//Aca lo que estoy validando es que el torneo exista y que la persona no pueda anotarse a un torneo el mismo dia

   private async validarTorneo(
    idTorneo: number,
    idPers: number
) {
    const torneo = await prisma.torneos.findUnique({
        where: {
            idTorneos: idTorneo
        }
    });

    if (!torneo) {
        throw new Error("El torneo ingresado no existe");
    }

    const inscripciones = await prisma.personas_torneos.findMany({
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
        this.validarTorneo(
            data.Personas_idPersona , data.Torneos_idTorneos
        )
        return await prisma.personas_torneos.create({
            data: {
                fecha_inscipcion: data.fecha_inscipcion,
                hora_inscripcion: data.fecha_inscipcion,
                
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
