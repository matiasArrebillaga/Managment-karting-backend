import {prisma} from "../../config/prisma.js";
import { CreateTorneos, UpdateTorneos } from "./torneo.interface.js";
import { hoyUTC } from "../../utils/fecha.js";

const ESTADOS = ["proximo", "en_curso", "finalizado"] as const;
type EstadoTorneo = typeof ESTADOS[number];

class TorneosService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private validarDatos(data: CreateTorneos | UpdateTorneos) {
        if (data.nombre !== undefined &&
            (typeof data.nombre !== "string" ||
                data.nombre.trim().length === 0 ||
                data.nombre.trim().length > 45)) {
            throw new Error("El nombre debe ser un texto de entre 1 y 45 caracteres");
        }

        if (data.descripcion !== undefined &&
            (typeof data.descripcion !== "string" ||
                data.descripcion.trim().length === 0 ||
                data.descripcion.trim().length > 45)) {
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

    // Derivado de las fechas contra el dia calendario local, igual que reservas e inscripciones
    private conEstado<T extends { fechaInicio: Date; fechaFin: Date }>(torneo: T) {
        const hoy = hoyUTC();
        const estado: EstadoTorneo = torneo.fechaFin < hoy ? "finalizado"
            : torneo.fechaInicio > hoy ? "proximo"
            : "en_curso";
        return { ...torneo, estado };
    }

    private filtroEstado(estado: string) {
        const hoy = hoyUTC();
        switch (estado) {
            case "proximo": return { fechaInicio: { gt: hoy } };
            case "finalizado": return { fechaFin: { lt: hoy } };
            case "en_curso": return { fechaInicio: { lte: hoy }, fechaFin: { gte: hoy } };
            default: throw new Error(`El estado debe ser uno de: ${ESTADOS.join(", ")}`);
        }
    }

    async getAll(estado?: string) {
        const torneos = await prisma.torneos.findMany({
            ...(estado !== undefined && { where: this.filtroEstado(estado) }),
            orderBy: { fechaInicio: "asc" }
        });
        return torneos.map((t: { fechaInicio: Date; fechaFin: Date }) => this.conEstado(t));
    }

    async getById(idTorneo: number) {
        this.validarId(idTorneo);
        const torneo = await prisma.torneos.findUnique({
            where: { idTorneos: idTorneo }
        });
        return torneo && this.conEstado(torneo);
    }

    async create(data: CreateTorneos) {
        this.validarDatos(data);
        return await prisma.torneos.create({
            data: {...data, nombre: data.nombre.trim(), descripcion: data.descripcion.trim()}
        });
    }

    async update(idTorneo: number, data: UpdateTorneos) {
        this.validarId(idTorneo);
        this.validarDatos(data);
        const actual = await prisma.torneos.findUnique({where: {idTorneos: idTorneo}});
        if (!actual) throw new Error("El torneo indicado no existe");
        const inicio = data.fechaInicio ?? actual.fechaInicio;
        const fin = data.fechaFin ?? actual.fechaFin;
        if (inicio >= fin) throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        return await prisma.torneos.update({
            where: { idTorneos: idTorneo },
            data: {
                ...data,
                ...(data.nombre === undefined ? {} : {nombre: data.nombre.trim()}),
                ...(data.descripcion === undefined ? {} : {descripcion: data.descripcion.trim()})
            }
        });
    }

    async delete(idTorneo: number) {
        this.validarId(idTorneo);
        return await prisma.torneos.delete({
            where: { idTorneos: idTorneo }
        });
    }

}

export default new TorneosService();
