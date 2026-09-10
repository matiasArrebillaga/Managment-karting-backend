import { prisma } from "../../config/prisma";
import { UpdateReserva, CreateReserva } from "./reserva.interface";

class ReservaService {
    async getAll() {
        return await prisma.reservas.findMany();
    }
    async getById(idReservas: number) {
        return await prisma.reservas.findUnique({
            where: { idReservas },
        });
    }
    async create(data: CreateReserva) {
        return await prisma.reservas.create({
            data,
        });
    }
    async update(idReservas: number, data: UpdateReserva) {
        return await prisma.reservas.update({
            where: { idReservas },
            data,
        });
    }
    async delete(idReservas: number) {
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
                tipoLicencias: { nivel: { gte: nivelRequerido } },
            },
        });
        if (!licenciaValida) {
            throw new Error(
                "La persona no cuenta con una licencia de nivel suficiente para el karting",
            );
        }
    }
    async realizarReserva (data: CreateReserva){
        await this.validarDisponibilidadRecursos(
            data.Kartings_idKartings, data.Circuitos_idCircuitos, data.fechaReserva
        );
        await this.validarEligibilidadLicencia(
            data.Personas_idPersona, data.Kartings_idKartings
        );
        return await prisma.reservas.create({
            data
        });
    }
}
export default new ReservaService();
