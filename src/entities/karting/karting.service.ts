import { CreateKarting, IKarting, UpdateKarting } from "./karting.interface";
import { prisma } from "../../config/prisma";

class KartingService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private validarDatos(data: CreateKarting | UpdateKarting) {
        for (const campo of ["categoria", "modelo", "estado"] as const) {
            const valor = data[campo];
            if (valor !== undefined && (typeof valor !== "string" || valor.trim().length === 0 || valor.trim().length > 45)) {
                throw new Error(`El campo ${campo} debe ser un texto de entre 1 y 45 caracteres`);
            }
        }

        if (data.fechaAdquisicion !== undefined) {
            const fecha = new Date(data.fechaAdquisicion);
            if (Number.isNaN(fecha.getTime())) {
                throw new Error("La fecha de adquisición no es válida");
            }
            if (fecha > new Date()) {
                throw new Error("La fecha de adquisición no puede ser futura");
            }
        }

        if (data.TiposKarting_idTiposKarting !== undefined &&
            !Number.isInteger(data.TiposKarting_idTiposKarting)) {
            throw new Error("El tipo de karting debe ser un identificador entero");
        }
    }

    async getAll() {
        return await prisma.kartings.findMany();
    }

    async getById(idKartings: number) {
        this.validarId(idKartings);
        return await prisma.kartings.findUnique({
            where: { idKartings }
        });
    }

    async create(data: CreateKarting) {
        this.validarDatos(data);
        const tipoKarting = await prisma.tiposkarting.findUnique({
            where: {
                idTiposKarting: data.TiposKarting_idTiposKarting
            }
        });

        if (!tipoKarting) {
            throw new Error("El tipo de karting ingresado no existe");
        }

        return await prisma.kartings.create({
            data: {
                ...data,
                categoria: data.categoria.trim(),
                modelo: data.modelo.trim(),
                estado: data.estado.trim(),
                fechaAdquisicion: new Date(data.fechaAdquisicion)
            }
        });
    }

    async update(idKartings: number, data: UpdateKarting) {
        this.validarId(idKartings);
        this.validarDatos(data);
        if (data.TiposKarting_idTiposKarting !== undefined) {
            const tipoKarting = await prisma.tiposkarting.findUnique({
                where: { idTiposKarting: data.TiposKarting_idTiposKarting }
            });
            if (!tipoKarting) {
                throw new Error("El tipo de karting ingresado no existe");
            }
        }
        return await prisma.kartings.update({
            where: { idKartings },
            data: {
                ...data,
                ...(data.categoria === undefined ? {} : { categoria: data.categoria.trim() }),
                ...(data.modelo === undefined ? {} : { modelo: data.modelo.trim() }),
                ...(data.estado === undefined ? {} : { estado: data.estado.trim() }),
                ...(data.fechaAdquisicion === undefined ? {} : { fechaAdquisicion: new Date(data.fechaAdquisicion) })
            }
        });
    }

    async delete(idKartings: number) {
        this.validarId(idKartings);
        return await prisma.kartings.delete({
            where: { idKartings }
        });
    }
}

export default new KartingService();