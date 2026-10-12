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

// karts que existen en la base, por id
let kartsEnBase: Record<number, string>;

beforeEach(() => {
    kartsEnBase = { 4: "Disponible", 5: "Disponible", 6: "Mantenimiento" };
    db.kartings = {
        findMany: jest.fn(async ({ where }: any) => where.idKartings.in
            .filter((id: number) => kartsEnBase[id] !== undefined)
            .map((id: number) => ({ idKartings: id, estado: kartsEnBase[id] })))
    };
    db.torneos = { findUnique: jest.fn(async () => ({
        idTorneos: 1, cupoMaximo: 8, fechaInicio: new Date(Date.UTC(2099, 0, 1)), fechaFin: new Date(Date.UTC(2099, 11, 31))
    })) };
    db.circuitos = { findUnique: jest.fn(async () => ({ idCircuitos: 1, maximo: 8 })) };
    db.reservas = { findMany: jest.fn(async () => [] as unknown[]) };
    db.carreras_kartings = { findMany: jest.fn(async () => [] as unknown[]) };
    db.carreras = {
        findMany: jest.fn(async () => [] as unknown[]),
        // carrera guardada con el kart 6, que hoy esta en mantenimiento
        findUnique: jest.fn(async () => ({
            horaInicio: hora("10:00"), horaFin: hora("11:00"),
            kartings: [{ Kartings_idKartings: 6, kartings: { idKartings: 6 } }]
        })),
        create: jest.fn(async ({ data }: any) => ({ ...data, kartings: [] })),
        update: jest.fn(async ({ data }: any) => ({ ...data, kartings: [] }))
    };
});

const carreraValida = (kartings: unknown = [4, 5]) => ({
    fechaCarrera: FECHA,
    horaInicio: "10:00",
    horaFin: "11:00",
    kartings: kartings as number[],
    Torneos_idTorneos: 1,
    Circuitos_idCircuitos: 1
});

describe("alta de una carrera con varios kartings", () => {
    it("crea la carrera con todos sus kartings en la transaccion", async () => {
        await carreraService.crearCarrera(carreraValida());

        expect(db.$transaction).toHaveBeenCalled();
        expect(db.carreras.create.mock.calls[0][0].data.kartings)
            .toEqual({ create: [{ Kartings_idKartings: 4 }, { Kartings_idKartings: 5 }] });
    });

    it.each([
        [[], /al menos un karting/],
        [null, /al menos un karting/],
        [[4, 4], /repetidos/],
        [[4, 99], /kartings 99 no existen/],
        [[4, 6], /kartings 6 no estan disponibles/],
    ])("rechaza kartings %p", async (kartings, error) => {
        await expect(carreraService.crearCarrera(carreraValida(kartings))).rejects.toThrow(error);
        expect(db.carreras.create).not.toHaveBeenCalled();
    });

    it("rechaza si un karting esta reservado en esa franja", async () => {
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 5, Circuitos_idCircuitos: 2 }
        ]);

        await expect(carreraService.crearCarrera(carreraValida()))
            .rejects.toThrow(/kartings 5 ya estan asignados en ese horario/);
        expect(db.carreras.create).not.toHaveBeenCalled();
    });

    it("rechaza si un karting corre otra carrera en esa franja", async () => {
        db.carreras_kartings.findMany = jest.fn(async () => [
            { Kartings_idKartings: 4, Carrera_Circuitos_idCircuitos: 2 }
        ]);

        await expect(carreraService.crearCarrera(carreraValida()))
            .rejects.toThrow(/kartings 4 ya estan asignados/);
    });

    it("rechaza si el circuito no tiene lugar para todos los kartings", async () => {
        db.circuitos.findUnique = jest.fn(async () => ({ idCircuitos: 1, maximo: 2 }));
        db.torneos.findUnique = jest.fn(async () => ({
            idTorneos: 1, cupoMaximo: 2, fechaInicio: new Date(Date.UTC(2099, 0, 1)), fechaFin: new Date(Date.UTC(2099, 11, 31))
        }));
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 9, Circuitos_idCircuitos: 1 }
        ]);

        await expect(carreraService.crearCarrera(carreraValida()))
            .rejects.toThrow(/no tiene lugar/);
    });
});

describe("update de una carrera", () => {
    it("al cambiar el horario se excluye a si misma, mira reservas y no exige estado a sus karts", async () => {
        await carreraService.update(FECHA, 1, 1, { horaFin: hora("12:00") });

        expect(db.carreras_kartings.findMany.mock.calls[0][0].where.carreras.NOT)
            .toEqual({ Torneos_idTorneos: 1, Circuitos_idCircuitos: 1 });
        expect(db.reservas.findMany).toHaveBeenCalled();
        expect(db.carreras.update.mock.calls[0][0].data.kartings).toBeUndefined();
    });

    it("reemplaza la lista completa de kartings", async () => {
        await carreraService.update(FECHA, 1, 1, { kartings: [4, 5] });

        expect(db.carreras.update.mock.calls[0][0].data.kartings).toEqual({
            deleteMany: {},
            create: [{ Kartings_idKartings: 4 }, { Kartings_idKartings: 5 }]
        });
    });

    it("exige que los kartings nuevos esten disponibles", async () => {
        await expect(carreraService.update(FECHA, 1, 1, { kartings: [6] }))
            .rejects.toThrow(/no estan disponibles/);
        expect(db.carreras.update).not.toHaveBeenCalled();
    });

    it("404 si la carrera no existe", async () => {
        db.carreras.findUnique = jest.fn(async () => null);

        await expect(carreraService.update(FECHA, 1, 1, { horaFin: hora("12:00") }))
            .rejects.toThrow(/no existe/);
    });
});
