
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import circuitoService from "../src/entities/circuito/circuito.service";

const db = prisma as unknown as Record<string, any>;

type Franja = {
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
};

// Crea una reserva de prueba
function reserva(horaInicio: string, horaFin: string) {
    return {
        fechaReserva: new Date("2026-12-10T00:00:00"),
        horaInicio: new Date(`2026-12-10T${horaInicio}:00`),
        horaFin: new Date(`2026-12-10T${horaFin}:00`)
    };
}

// Crea un kart que participa de una carrera
function kartDeCarrera(horaInicio: string, horaFin: string) {
    return {
        Carrera_fecha: new Date("2026-12-10T00:00:00"),
        carreras: {
            horaInicio: new Date(`2026-12-10T${horaInicio}:00`),
            horaFin: new Date(`2026-12-10T${horaFin}:00`)
        }
    };
}

// Helpers utilizados en las pruebas de ocupación
// Conservá estas funciones si ya las tenés definidas en tu archivo.
beforeEach(() => {
    jest.clearAllMocks();

    db.$queryRaw = jest.fn(async () => [{ idCircuitos: 1 }]);

    db.$transaction = jest.fn(async (callback: any) => callback(db));

    db.torneos = {
        aggregate: jest.fn(async () => ({
            _max: { cupoMaximo: null }
        }))
    };

    db.reservas = {
        findMany: jest.fn(async () => [])
    };

    db.carreras_kartings = {
        findMany: jest.fn(async () => [])
    };

    db.circuitos = {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(async ({ data }: any) => data),
        delete: jest.fn()
    };
});

describe("getAll", () => {
    it("devuelve todos los circuitos", async () => {
        const circuitos = [
            { idCircuitos: 1, dificultad: "Baja", distancia: 100, maximo: 10 },
            { idCircuitos: 2, dificultad: "Alta", distancia: 200, maximo: 15 }
        ];

        db.circuitos.findMany.mockResolvedValue(circuitos);

        const resultado = await circuitoService.getAll();

        expect(resultado).toEqual(circuitos);
        expect(db.circuitos.findMany).toHaveBeenCalled();
    });
});

describe("getById", () => {
    it("devuelve un circuito existente", async () => {
        const circuito = {
            idCircuitos: 1,
            dificultad: "Alta",
            distancia: 200,
            maximo: 10
        };

        db.circuitos.findUnique.mockResolvedValue(circuito);

        const resultado = await circuitoService.getById(1);

        expect(resultado).toEqual(circuito);
        expect(db.circuitos.findUnique).toHaveBeenCalledWith({
            where: { idCircuitos: 1 }
        });
    });

    it("devuelve null si el circuito no existe", async () => {
        db.circuitos.findUnique.mockResolvedValue(null);

        const resultado = await circuitoService.getById(999);

        expect(resultado).toBeNull();
    });

    it("rechaza un identificador inválido", async () => {
        await expect(circuitoService.getById(0)).rejects.toThrow();
    });
});

describe("create", () => {
    it("crea un circuito correctamente y limpia la dificultad", async () => {
        const datos = {
            distancia: 200,
            dificultad: " Alta ",
            maximo: 10
        };

        db.circuitos.create.mockImplementation(async ({ data }: any) => data);

        const resultado = await circuitoService.create(datos);

        expect(resultado).toEqual({
            distancia: 200,
            dificultad: "Alta",
            maximo: 10
        });

        expect(db.circuitos.create).toHaveBeenCalledWith({
            data: {
                distancia: 200,
                dificultad: "Alta",
                maximo: 10
            }
        });
    });
});

describe("update", () => {
    it("actualiza un circuito sin modificar el máximo sin abrir transacción", async () => {
        await circuitoService.update(1, { dificultad: "Alta" });

        expect(db.$transaction).not.toHaveBeenCalled();
        expect(db.circuitos.update).toHaveBeenCalled();
    });

    it("bloquea el circuito con FOR UPDATE antes de validar", async () => {
        await circuitoService.update(1, { maximo: 4 });

        expect(db.$queryRaw.mock.calls[0][0].join("?")).toContain("FOR UPDATE");

        expect(db.$transaction.mock.calls[0][1]).toEqual({
            isolationLevel: "ReadCommitted"
        });

        expect(db.circuitos.update.mock.calls[0][0].data.maximo).toBe(4);
    });

    it("devuelve 404 si el circuito no existe", async () => {
        db.$queryRaw = jest.fn(async () => []);

        await expect(
            circuitoService.update(1, { maximo: 4 })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("no permite bajar el máximo por debajo del cupo de un torneo", async () => {
        db.torneos.aggregate = jest.fn(async () => ({
            _max: { cupoMaximo: 6 }
        }));

        await expect(
            circuitoService.update(1, { maximo: 5 })
        ).rejects.toThrow("menor que 6");

        expect(db.circuitos.update).not.toHaveBeenCalled();
    });

    it("cuenta el pico simultáneo sumando reservas y karts de carreras", async () => {
        // 10-12 y 11-13 se pisan con el kart de carrera 11:30-12:30.
        // Hay 3 kartings simultáneamente.
        db.reservas.findMany = jest.fn(async () => [
            reserva("10:00", "12:00"),
            reserva("11:00", "13:00")
        ]);

        db.carreras_kartings.findMany = jest.fn(async () => [
            kartDeCarrera("11:30", "12:30")
        ]);

        await expect(
            circuitoService.update(1, { maximo: 2 })
        ).rejects.toThrow("ya hay 3 kartings en pista");

        await circuitoService.update(1, { maximo: 3 });

        expect(db.circuitos.update).toHaveBeenCalledTimes(1);
    });

    it("considera que las franjas que se tocan en el borde no se pisan", async () => {
        db.reservas.findMany = jest.fn(async () => [
            reserva("10:00", "11:00"),
            reserva("11:00", "12:00")
        ]);

        await circuitoService.update(1, { maximo: 1 });

        expect(db.circuitos.update).toHaveBeenCalled();
    });

    it("rechaza un identificador inválido", async () => {
        await expect(
            circuitoService.update(0, { dificultad: "Alta" })
        ).rejects.toThrow();
    });
});

describe("delete", () => {
    it("elimina un circuito correctamente", async () => {
        const circuitoEliminado = { idCircuitos: 1 };

        db.circuitos.delete.mockResolvedValue(circuitoEliminado);

        const resultado = await circuitoService.delete(1);

        expect(resultado).toEqual(circuitoEliminado);

        expect(db.circuitos.delete).toHaveBeenCalledWith({
            where: { idCircuitos: 1 }
        });
    });

    it("rechaza un identificador inválido", async () => {
        await expect(circuitoService.delete(0)).rejects.toThrow();
    });
});
