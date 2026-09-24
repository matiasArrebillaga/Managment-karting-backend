import { prisma } from "../../config/prisma";
import { UpdateReserva, CreateReserva } from "./reserva.interface";

class ReservaService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarDatos(data: CreateReserva | UpdateReserva) {
        for (const campo of ["Personas_idPersona", "Circuitos_idCircuitos", "Kartings_idKartings"] as const) {
            if (data[campo] !== undefined && !Number.isInteger(data[campo])) throw new Error(`El campo ${campo} debe ser un identificador entero`);
        }
        if (data.monto !== undefined && (!Number.isFinite(data.monto) || data.monto < 0)) throw new Error("El monto debe ser un número válido mayor o igual a cero");
        if (data.fechaReserva !== undefined) {
            const fecha = new Date(data.fechaReserva);
            if (Number.isNaN(fecha.getTime())) throw new Error("La fecha de reserva no es válida");
        }
    }
    async getAll() {
        return await prisma.reservas.findMany();
    }
    async getById(idReservas: number) {
        this.validarId(idReservas);
        return await prisma.reservas.findUnique({
            where: { idReservas },
        });
    }
    async create(data: CreateReserva) {
        this.validarDatos(data);
        return await prisma.reservas.create({
            data,
        });
    }
    async update(idReservas: number, data: UpdateReserva) {
        this.validarId(idReservas);
        this.validarDatos(data);
        for (const [campo, tabla, clave] of [
            ["Personas_idPersona", prisma.personas, "idPersona"],
            ["Circuitos_idCircuitos", prisma.circuitos, "idCircuitos"],
            ["Kartings_idKartings", prisma.kartings, "idKartings"]
        ] as const) {
            const valor = data[campo as keyof UpdateReserva] as number | undefined;
            if (valor !== undefined && !await (tabla as any).findUnique({where: {[clave]: valor}})) {
                throw new Error(`La relación ${campo} indicada no existe`);
            }
        }
        return await prisma.reservas.update({
            where: { idReservas },
            data,
        });
    }
    async delete(idReservas: number) {
        this.validarId(idReservas);
        return await prisma.reservas.delete({
            where: { idReservas },
        });
    }
    private async validarDisponibilidadRecursos(
        kartingId: number,
        circuitoId: number,
        fecha: Date,
    ): Promise<void> {
        const kartingOcupado = await prisma.reservas.findFirst({
            where: {
                Kartings_idKartings: kartingId,
                fechaReserva: fecha,
            },
        });
        if (kartingOcupado) {
            throw new Error("El karting seleccionado ya está reservado para esa fecha");
        }
        const circuito = await prisma.circuitos.findUnique({
            where: { idCircuitos: circuitoId },
        });
        if (!circuito) {
            throw new Error("El circuito no existe");
        }
        const reservasDelDia = await prisma.reservas.count({
            where: {
                Circuitos_idCircuitos: circuitoId,
                fechaReserva: fecha,
            },
        });
        if (reservasDelDia >= circuito.maximo) {
            throw new Error("El circuito alcanzo el cupo maximo de kartings para esa fecha");
        }
    }

    private async validarEligibilidadLicencia(personaId: number, kartingId: number): Promise<void> {
        const karting = await prisma.kartings.findUnique({
            where: { idKartings: kartingId },
            include: {
                tiposkarting: {
                    include: { tiposlicencias: true },
                },
            },
        });
        if (!karting) {
            throw new Error("El karting no existe");
        }
        const nivelRequerido = karting.tiposkarting.tiposlicencias.nivel;
        const hoy = new Date();

        const licenciaValida = await prisma.licencias.findFirst({
            where: {
                Personas_idPersona: personaId,
                fechaVencimiento: { gte: hoy },
                tiposlicencias: { nivel: { gte: nivelRequerido } },
            },
        });
        if (!licenciaValida) {
            throw new Error(
                "La persona no cuenta con una licencia de nivel suficiente para el karting",
            );
        }
    }
    async realizarReserva (data: CreateReserva){
        this.validarDatos(data);
        const [persona, karting] = await Promise.all([
            prisma.personas.findUnique({where: {idPersona: data.Personas_idPersona}}),
            prisma.kartings.findUnique({where: {idKartings: data.Kartings_idKartings}})
        ]);
        if (!persona) throw new Error("La persona no existe");
        if (!karting) throw new Error("El karting no existe");
        await this.validarDisponibilidadRecursos(
            data.Kartings_idKartings, data.Circuitos_idCircuitos, data.fechaReserva
        );
        await this.validarEligibilidadLicencia(
            data.Personas_idPersona, data.Kartings_idKartings
        );
        return await prisma.reservas.create({
            data: {...data, fechaReserva: new Date(data.fechaReserva)}
        });
    }
}
export default new ReservaService();
