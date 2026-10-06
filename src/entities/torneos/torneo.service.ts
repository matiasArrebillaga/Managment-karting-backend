import {prisma} from "../../config/prisma.js";
import { CreateTorneos, ITorneos, UpdateTorneos } from "./torneo.interface.js";
import { hoyUTC } from "../../utils/fecha.js";

const ESTADOS = ["proximo", "en_curso", "finalizado"] as const;
type EstadoTorneo = typeof ESTADOS[number];

class TorneosService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private validarDatos(data: Partial<Omit<ITorneos, "idTorneos">>) {
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

    // calcula el estado con la fecha de hoy
    private conEstado<T extends { fechaInicio: Date; fechaFin: Date }>(torneo: T) {
        const hoy = hoyUTC();
        const estado: EstadoTorneo = torneo.fechaFin < hoy ? "finalizado"
            : torneo.fechaInicio > hoy ? "proximo"
            : "en_curso";
        return { ...torneo, estado };
    }
    // construye el filtro para prisma 
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
        const datos = {...data, fechaInicio: new Date(data.fechaInicio), fechaFin: new Date(data.fechaFin)};
        this.validarDatos(datos);
        return await prisma.torneos.create({
            data: {...datos, nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim()}
        });
    }

    async update(idTorneo: number, data: UpdateTorneos) {
        this.validarId(idTorneo);
        // solo convierte las fechas que vienen, el patch es parcial
        const datos = {
            ...data,
            fechaInicio: data.fechaInicio === undefined ? undefined : new Date(data.fechaInicio),
            fechaFin: data.fechaFin === undefined ? undefined : new Date(data.fechaFin)
        };
        this.validarDatos(datos);
        const actual = await prisma.torneos.findUnique({where: {idTorneos: idTorneo}});
        if (!actual) throw new Error("El torneo indicado no existe");
        const inicio = datos.fechaInicio ?? actual.fechaInicio;
        const fin = datos.fechaFin ?? actual.fechaFin;
        if (inicio >= fin) throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        return await prisma.torneos.update({
            where: { idTorneos: idTorneo },
            data: {
                ...datos,
                ...(datos.nombre === undefined ? {} : {nombre: datos.nombre.trim()}),
                ...(datos.descripcion === undefined ? {} : {descripcion: datos.descripcion.trim()})
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
