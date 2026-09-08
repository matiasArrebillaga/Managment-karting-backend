import {prisma} from "../../config/prisma.js";
import { CreateTorneos, UpdateTorneos } from "./torneo.interface.js";

class TorneosService {

    async getAll() {
        return await prisma.torneos.findMany();
    }

    async getById(idTorneo: number) {
        return await prisma.torneos.findUnique({
            where: { idTorneos: idTorneo }
        });
    }

    async create(data: CreateTorneos) {
        return await prisma.torneos.create({
            data
        });
    }

    async update(idTorneo: number, data: UpdateTorneos) {
        return await prisma.torneos.update({
            where: { idTorneos: idTorneo },
            data
        });
    }

    async delete(idTorneo: number) {
        return await prisma.torneos.delete({
            where: { idTorneos: idTorneo }
        });
    }

}

export default new TorneosService();

