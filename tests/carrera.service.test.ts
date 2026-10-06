import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import carreraService from "../src/entities/carrera/carrera.service";

const db = prisma as unknown as Record<string, any>;

const hora = (texto: string) => {
    const [h, m] = texto.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, h, m));
};

const FECHA = new Date(Date.UTC(2099, 5, 1));

beforeEach(() => {
    db.kartings = { findUnique: jest.fn(async () => ({ idKartings: 4, estado: "Disponible" })) };
    db.torneos = { findUnique: jest.fn(async () => ({
        idTorneos: 1, cupoMaximo: 8, fechaInicio: new Date(Date.UTC(2099, 0, 1)), fechaFin: new Date(Date.UTC(2099, 11, 31))
    })) };
    db.circuitos = { findUnique: jest.fn(async () => ({ idCircuitos: 1, maximo: 8 })) };
    db.reservas = { findMany: jest.fn(async () => [] as unknown[]) };
    db.carreras = {
        findMany: jest.fn(async () => [] as unknown[]),
        findUnique: jest.fn(async () => ({ horaInicio: hora("10:00"), horaFin: hora("11:00") })),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

const carreraValida = () => ({
    fechaCarrera: FECHA,
    horaInicio: "10:00",
    horaFin: "11:00",
    Kartings_idKartings: 4,
    Torneos_idTorneos: 1,
    Circuitos_idCircuitos: 1
});

describe("disponibilidad del karting en carreras", () => {
    it("rechaza si el karting esta reservado en esa franja", async () => {
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 4, Circuitos_idCircuitos: 2 }
        ]);

        await expect(carreraService.crearCarrera(carreraValida()))
            .rejects.toThrow(/ya esta asignado en ese horario/);
        expect(db.carreras.create).not.toHaveBeenCalled();
    });

    it("al cambiar el horario se excluye a si misma y mira reservas", async () => {
        await carreraService.update(FECHA, 4, 1, 1, { horaFin: hora("12:00") });

        expect(db.carreras.findMany.mock.calls[0][0].where.NOT)
            .toEqual({ Torneos_idTorneos: 1, Circuitos_idCircuitos: 1 });
        expect(db.reservas.findMany).toHaveBeenCalled();
        expect(db.carreras.update).toHaveBeenCalled();
    });
});
