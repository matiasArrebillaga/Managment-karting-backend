
import {prisma} from "../../config/prisma.js";
import { CreateCarrera, UpdateCarrera } from "../carrera/carrera.interface.js";

class CarrerasService {

    // Obtener todas las carreras
    async getAll() {
        return await prisma.carreras.findMany();
    }

    // Obtener una carrera por su clave primaria compuesta
    async getById(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number
    ) {
        return await prisma.carreras.findUnique({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings,
                    Torneos_idTorneos,
                    Circuitos_idCircuitos,
                    fechaCarrera
                }
            }
        });
    }

    // Crear una carrera
    async create(data: CreateCarrera) {
        return await prisma.carreras.create({
            data: {
                fechaCarrera: data.fechaCarrera,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,

                kartings: {
                    connect: {
                        idKartings: data.Kartings_idKartings
                    }
                },

                torneos: {
                    connect: {
                        idTorneos: data.Torneos_idTorneos
                    }
                },

                circuitos: {
                    connect: {
                        idCircuitos: data.Circuitos_idCircuitos
                    }
                }
            }
        });
    }

    // Actualizar una carrera
    async update(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number,
        data: UpdateCarrera
    ) {
        return await prisma.carreras.update({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings,
                    Torneos_idTorneos,
                    Circuitos_idCircuitos,
                    fechaCarrera
                }
            },
            data
        });
    }

    // Eliminar una carrera
    async delete(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number
    ) {
        return await prisma.carreras.delete({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings,
                    Torneos_idTorneos,
                    Circuitos_idCircuitos,
                    fechaCarrera
                }
            }
        });
    }
}

export default new CarrerasService();
