import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import circuitoService from "../src/entities/circuito/circuito.service";

const db = prisma as unknown as Record<string, any>;

const hora = (texto: string) => {
    const [h, m] = texto.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, h, m));
};
const DIA = new Date(Date.UTC(2099, 5, 1));
const reserva = (inicio: string, fin: string) => ({ fechaReserva: DIA, horaInicio: hora(inicio), horaFin: hora(fin) });
const kartDeCarrera = (inicio: string, fin: string) => ({ Carrera_fecha: DIA, carreras: { horaInicio: hora(inicio), horaFin: hora(fin) } });

beforeEach(() => {
    db.$transaction.mockClear();
    db.$queryRaw = jest.fn(async () => [{ idCircuitos: 1 }]);
    db.torneos = { aggregate: jest.fn(async () => ({ _max: { cupoMaximo: null } })) };
    db.reservas = { findMany: jest.fn(async () => [] as unknown[]) };
    db.carreras_kartings = { findMany: jest.fn(async () => [] as unknown[]) };
    db.circuitos = { update: jest.fn(async ({ data }: any) => data) };
});

describe("bajar el maximo de un circuito (KAN-90)", () => {
    it("sin tocar el maximo no abre transaccion ni bloquea", async () => {
        await circuitoService.update(1, { dificultad: "Alta" });

        expect(db.$transaction).not.toHaveBeenCalled();
        expect(db.circuitos.update).toHaveBeenCalled();
    });

    it("bloquea el circuito con FOR UPDATE antes de validar", async () => {
        await circuitoService.update(1, { maximo: 4 });

        expect(db.$queryRaw.mock.calls[0][0].join("?")).toContain("FOR UPDATE");
        expect(db.$transaction.mock.calls[0][1]).toEqual({ isolationLevel: "ReadCommitted" });
        expect(db.circuitos.update.mock.calls[0][0].data.maximo).toBe(4);
    });

    it("404 si el circuito no existe", async () => {
        db.$queryRaw = jest.fn(async () => []);

        await expect(circuitoService.update(1, { maximo: 4 })).rejects.toMatchObject({ statusCode: 404 });
    });

    it("no baja por debajo del cupo de un torneo que corre ahi", async () => {
        db.torneos.aggregate = jest.fn(async () => ({ _max: { cupoMaximo: 6 } }));

        await expect(circuitoService.update(1, { maximo: 5 })).rejects.toThrow("menor que 6");
        expect(db.circuitos.update).not.toHaveBeenCalled();
    });

    it("cuenta el pico simultaneo sumando reservas y karts de carreras", async () => {
        // 10-12 y 11-13 se pisan con el kart de carrera 11:30-12:30: hay 3 juntos
        db.reservas.findMany = jest.fn(async () => [reserva("10:00", "12:00"), reserva("11:00", "13:00")]);
        db.carreras_kartings.findMany = jest.fn(async () => [kartDeCarrera("11:30", "12:30")]);

        await expect(circuitoService.update(1, { maximo: 2 })).rejects.toThrow("ya hay 3 kartings en pista");
        await circuitoService.update(1, { maximo: 3 });
        expect(db.circuitos.update).toHaveBeenCalledTimes(1);
    });

    it("franjas que se tocan en el borde (10-11 y 11-12) no se pisan", async () => {
        db.reservas.findMany = jest.fn(async () => [reserva("10:00", "11:00"), reserva("11:00", "12:00")]);

        await circuitoService.update(1, { maximo: 1 });

        expect(db.circuitos.update).toHaveBeenCalled();
    });
});
