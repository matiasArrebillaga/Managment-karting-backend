import { CreateKarting, IKarting, UpdateKarting } from "./karting.interface";
import { prisma } from "../../config/prisma";

class KartingService {

    async getAll() {
        return await prisma.kartings.findMany();
    }

    async getById(idKartings: number) {
        return await prisma.kartings.findUnique({
            where: { idKartings }
        });
    }

    async create(data: CreateKarting) {

        // Validar que exista el tipo de karting
        const tipoKarting = await prisma.tiposkarting.findUnique({
            where: {
                idTiposKarting: data.TiposKarting_idTiposKarting
            }
        });

        if (!tipoKarting) {
            throw new Error("El tipo de karting ingresado no existe");
        }

        return await prisma.kartings.create({
            data
        });
    }

    async update(idKartings: number, data: UpdateKarting) {
        return await prisma.kartings.update({
            where: { idKartings },
            data
        });
    }

    async delete(idKartings: number) {
        return await prisma.kartings.delete({
            where: { idKartings }
        });
    }
}

export default new KartingService();