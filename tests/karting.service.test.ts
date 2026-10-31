
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import kartingService from "../src/entities/karting/karting.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.tiposkarting = {
        findUnique: jest.fn(async () => ({ idTiposKarting: 1 }))
    };

    db.kartings = {
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

const kartingValido = {
    categoria: "Adulto",
    modelo: "K1",
    estado: "Disponible",
    fechaAdquisicion: "2025-01-15",
    TiposKarting_idTiposKarting: 1
};

describe("seguridad de karting", () => {
    it("create ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            ...kartingValido,
            idKartings: 999,
            reservas: { create: [{}] }
        };

        await kartingService.create(datosMaliciosos as any);

        const datosEnviados = db.kartings.create.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            categoria: "Adulto",
            modelo: "K1",
            estado: "Disponible",
            fechaAdquisicion: new Date("2025-01-15"),
            TiposKarting_idTiposKarting: 1
        });
        expect(datosEnviados).not.toHaveProperty("idKartings");
        expect(datosEnviados).not.toHaveProperty("reservas");
    });

    it("update ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            modelo: "K2",
            idKartings: 999,
            reservas: { create: [{}] }
        };

        await kartingService.update(1, datosMaliciosos as any);

        const datosEnviados = db.kartings.update.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({ modelo: "K2" });
        expect(datosEnviados).not.toHaveProperty("idKartings");
        expect(datosEnviados).not.toHaveProperty("reservas");
    });
});

describe("kartings disponibles en una franja", () => {
    const filtroKartings = () => db.kartings.findMany.mock.calls[0][0].where;

    beforeEach(() => {
        db.kartings = { findMany: jest.fn(async () => [] as unknown[]) };
        // kart 4 reservado y kart 7 en una carrera, los dos en la franja pedida
        db.reservas = { findMany: jest.fn(async () => [{ Kartings_idKartings: 4, Circuitos_idCircuitos: 1 }]) };
        db.carreras_kartings = { findMany: jest.fn(async () => [{ Kartings_idKartings: 7, Carrera_Circuitos_idCircuitos: 2 }]) };
    });

    it("excluye los ocupados por reservas y carreras y los que no estan Disponible", async () => {
        await kartingService.getDisponibles("2026-10-29", "10:00", "12:00");

        expect(filtroKartings()).toEqual({ estado: "Disponible", idKartings: { notIn: [4, 7] } });
    });

    it("al editar no cuenta la reserva que se esta editando", async () => {
        await kartingService.getDisponibles("2026-10-29", "10:00", "12:00", { idReserva: 8 });

        expect(db.reservas.findMany.mock.calls[0][0].where.NOT).toEqual({ idReservas: 8 });
    });

    it("rechaza una franja invertida", async () => {
        await expect(kartingService.getDisponibles("2026-10-29", "12:00", "10:00"))
            .rejects.toThrow("La hora de inicio debe ser anterior a la hora de fin");
    });

    it("rechaza una fecha invalida (400, no 500)", async () => {
        await expect(kartingService.getDisponibles(undefined, "10:00", "12:00"))
            .rejects.toThrow("La fecha no es válida");
    });
});
