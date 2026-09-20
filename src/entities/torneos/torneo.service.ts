import {prisma} from "../../config/prisma.js";
import { CreateTorneos, UpdateTorneos } from "./torneo.interface.js";

class TorneosService {

    private validarDatos(data: CreateTorneos | UpdateTorneos) {
        if (data.nombre !== undefined &&
            (typeof data.nombre !== "string" ||
                data.nombre.trim().length === 0 ||
                data.nombre.length > 45)) {
            throw new Error("El nombre debe ser un texto de entre 1 y 45 caracteres");
        }

        if (data.descripcion !== undefined &&
            (typeof data.descripcion !== "string" ||
                data.descripcion.trim().length === 0 ||
                data.descripcion.length > 45)) {
            throw new Error("La descripción debe ser un texto de entre 1 y 45 caracteres");
        }

        if (data.cupoMaximo !== undefined &&
            (!Number.isInteger(data.cupoMaximo) || data.cupoMaximo <= 0)) {
            throw new Error("El cupo máximo debe ser un número entero mayor que cero");
        }

        if (data.fechaInicio !== undefined && isNaN(data.fechaInicio.getTime())) {
            throw new Error("La fecha de inicio no es válida");
        }

        if (data.fechaFin !== undefined && isNaN(data.fechaFin.getTime())) {
            throw new Error("La fecha de fin no es válida");
        }

        if (data.fechaInicio !== undefined && data.fechaFin !== undefined &&
            data.fechaInicio >= data.fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
    }

    async getAll() {
        return await prisma.torneos.findMany();
    }

    async getById(idTorneo: number) {
        return await prisma.torneos.findUnique({
            where: { idTorneos: idTorneo }
        });
    }

    async create(data: CreateTorneos) {
        this.validarDatos(data);
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
