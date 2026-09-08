
import {prisma} from "../../config/prisma.js";
import {
    CreateParticipacion,
    UpdateParticipacion
} from "./participacion.interface.js";

class ParticipacionesService {

    // Obtener todas las participaciones
    async getAll() {
        return await prisma.participaciones.findMany();
    }

    // Obtener una participación por su clave primaria compuesta
    async getById(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number
    ) {
        return await prisma.participaciones.findUnique({
            where: {
                Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                }
            }
        });
    }
    
    //Buscar Participacion por fecha
    async getByFecha(
        fechaCarrera: Date
    ) {
        return await prisma.participaciones.findMany({
            where: {Carrera_fecha : fechaCarrera
                }
            })
    }

    // Crear una participación
    async create(data: CreateParticipacion) {
        return await prisma.participaciones.create({
            data: {
                puntos: data.puntos,
                tiempo: data.tiempo,
                posicion_final: data.posicion_final,

                carreras: {
                    connect: {
                        Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                            Kartings_idKartings: data.Carrera_Kartings_idKartings,
                            Torneos_idTorneos: data.Carrera_Torneos_idTorneos,
                            Circuitos_idCircuitos: data.Carrera_Circuitos_idCircuitos,
                            fechaCarrera: data.Carrera_fecha
                        }
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

    // Actualizar una participación
    async update(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number,
        data: UpdateParticipacion
    ) {
        return await prisma.participaciones.update({
            where: {
                Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                }
            },
            data
        });
    }

    // Eliminar una participación
    async delete(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number
    ) {
        return await prisma.participaciones.delete({
            where: {
                Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                }
            }
        });
    }
}

export default new ParticipacionesService();

