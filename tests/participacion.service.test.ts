import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import participacionService from "../src/entities/participacion/participacion.service";

const db = prisma as unknown as Record<string, any>;

// Arma una carrera que termina en `instante` (hora local), guardada como la guarda la DB:
// el dia en DATE a medianoche UTC y la hora de pared en TIME sobre la epoch UTC.
const carreraQueTermina = (instante: Date) => ({
    fechaCarrera: new Date(Date.UTC(instante.getFullYear(), instante.getMonth(), instante.getDate())),
    horaInicio: new Date(Date.UTC(1970, 0, 1, 0, 0)),
    horaFin: new Date(Date.UTC(1970, 0, 1, instante.getHours(), instante.getMinutes())),
});

const HORA = 60 * 60 * 1000;

const CLAVES = {
    Carrera_Kartings_idKartings: 1,
    Carrera_Torneos_idTorneos: 1,
    Carrera_Circuitos_idCircuitos: 1,
    Carrera_fecha: new Date("2026-09-05"),
};

const fila = (Personas_idPersona: number, posicion_final: number) =>
    ({ Personas_idPersona, posicion_final, tiempo: "00:12:35" });

const filasCreadas = () => db.participaciones.createMany.mock.calls[0][0].data;

beforeEach(() => {
    db.$transaction.mockClear();
    db.carreras = { findUnique: jest.fn(async () => carreraQueTermina(new Date(Date.now() - HORA))) };
    // todos los pedidos estan inscriptos, salvo que el test diga otra cosa
    db.personas_torneos = {
        findMany: jest.fn(async ({ where }: any) =>
            where.Personas_idPersona.in.map((id: number) => ({ Personas_idPersona: id })))
    };
    db.participaciones = {
        count: jest.fn(async () => 0),
        create: jest.fn(async ({ data }: any) => data),
        createMany: jest.fn(async ({ data }: any) => ({ count: data.length })),
        findMany: jest.fn(async () => []),
        update: jest.fn(async ({ data }: any) => data),
    };
});

describe("carga de la clasificación completa", () => {
    it("calcula los puntos por posición con la escala F1", async () => {
        const resultados = Array.from({ length: 11 }, (_, i) => fila(i + 1, i + 1));

        await participacionService.registrarResultadosCarrera(CLAVES, resultados);

        const puntos = filasCreadas().map((f: any) => f.puntos);
        expect(puntos).toEqual([25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0]);
    });

    it("acepta las posiciones en cualquier orden", async () => {
        await participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 2), fila(2, 1)]);

        expect(filasCreadas()).toHaveLength(2);
    });

    it.each([
        ["repetidas", [fila(1, 1), fila(2, 2), fila(3, 2)]],
        ["con saltos", [fila(1, 1), fila(2, 3)]],
        ["que no empiezan en 1", [fila(1, 2)]],
    ])("rechaza posiciones %s", async (_caso, resultados) => {
        await expect(participacionService.registrarResultadosCarrera(CLAVES, resultados))
            .rejects.toThrow("Las posiciones deben ser exactamente");
        expect(db.participaciones.createMany).not.toHaveBeenCalled();
    });

    it("rechaza una persona repetida", async () => {
        await expect(participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 1), fila(1, 2)]))
            .rejects.toThrow("más de una vez");
    });

    it("rechaza un tiempo sin formato HH:MM:SS", async () => {
        await expect(participacionService.registrarResultadosCarrera(CLAVES, [{ ...fila(1, 1), tiempo: "12:35" }]))
            .rejects.toThrow("HH:MM:SS");
    });

    it("rechaza una lista vacía", async () => {
        await expect(participacionService.registrarResultadosCarrera(CLAVES, []))
            .rejects.toThrow("al menos un resultado");
    });

    it("informa qué personas no están inscriptas", async () => {
        db.personas_torneos.findMany = jest.fn(async () => [{ Personas_idPersona: 1 }]);

        await expect(participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 1), fila(7, 2)]))
            .rejects.toThrow("Las personas 7 no están inscriptas");
    });

    it("rechaza con 409 una carrera que ya tiene resultados", async () => {
        db.participaciones.count = jest.fn(async () => 3);

        await expect(participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 1)]))
            .rejects.toMatchObject({ statusCode: 409 });
        expect(db.participaciones.createMany).not.toHaveBeenCalled();
    });

    it("rechaza con 404 una carrera que no existe", async () => {
        db.carreras.findUnique = jest.fn(async () => null);

        await expect(participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 1)]))
            .rejects.toMatchObject({ statusCode: 404 });
    });
});

describe("carrera finalizada (hora local de la carrera)", () => {
    it("rechaza una carrera que termina dentro de una hora", async () => {
        db.carreras.findUnique = jest.fn(async () => carreraQueTermina(new Date(Date.now() + HORA)));

        await expect(participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 1)]))
            .rejects.toThrow("aun no paso");
    });

    it("acepta una carrera que terminó hace una hora", async () => {
        await expect(participacionService.registrarResultadosCarrera(CLAVES, [fila(1, 1)]))
            .resolves.toBeDefined();
    });
});

describe("alta individual", () => {
    it("ignora los puntos del body y los calcula por la posición", async () => {
        const data = { ...CLAVES, ...fila(1, 3), puntos: 99 } as any;

        const creada = await participacionService.registrarParticipacion(data) as any;

        expect(creada.puntos).toBe(15);
    });
});

describe("PUT", () => {
    const actualizar = (data: any) => participacionService.update(1, 1, 1, CLAVES.Carrera_fecha, 1, data);

    it.each([
        [{ tiempo: "" }, "HH:MM:SS"],
        [{ posicion_final: 0 }, "mayor o igual a 1"],
        [{ posicion_final: 1.5 }, "mayor o igual a 1"],
    ])("rechaza %p", async (data, mensaje) => {
        await expect(actualizar(data)).rejects.toThrow(mensaje);
        expect(db.participaciones.update).not.toHaveBeenCalled();
    });

    it("cambiar la posición recalcula los puntos", async () => {
        await actualizar({ posicion_final: 2 });

        expect(db.participaciones.update.mock.calls[0][0].data).toEqual({ posicion_final: 2, puntos: 18 });
    });

    it("cambiar sólo el tiempo no toca puntos ni posición", async () => {
        await actualizar({ tiempo: "00:13:00" });

        expect(db.participaciones.update.mock.calls[0][0].data).toEqual({ tiempo: "00:13:00" });
    });
});

describe("tabla general", () => {
    const part = (Personas_idPersona: number, posicion_final: number) =>
        ({ Personas_idPersona, posicion_final, puntos: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][posicion_final - 1] ?? 0 });

    const conTabla = (participaciones: unknown[]) => {
        db.torneos = { findUnique: jest.fn(async () => ({ idTorneos: 1 })) };
        db.participaciones.findMany = jest.fn(async () => participaciones);
        db.personas = {
            findMany: jest.fn(async ({ where }: any) =>
                where.idPersona.in.map((id: number) => ({ idPersona: id, nombre: `P${id}`, apellido: "X" })))
        };
        return participacionService.getTablaGeneral(1);
    };

    it("a igual puntaje gana el de más victorias", async () => {
        // 1: 1° + 3° = 25 + 15 = 40, una victoria · 2: 2° + 2° + 8° = 18 + 18 + 4 = 40, ninguna
        const tabla = await conTabla([
            part(2, 2), part(2, 2), part(2, 8),
            part(1, 1), part(1, 3),
        ]);

        expect(tabla.map(t => [t.idPersona, t.posicion, t.puntosTotales, t.victorias]))
            .toEqual([[1, 1, 40, 1], [2, 2, 40, 0]]);
    });

    it("el empate total comparte posición y la siguiente salta", async () => {
        // 3 y 4: 1° + 4° = 37 con los mismos puestos · 5: 2° + 2° = 36
        const tabla = await conTabla([
            part(3, 1), part(3, 4),
            part(4, 4), part(4, 1),
            part(5, 2), part(5, 2),
        ]);

        expect(tabla.map(t => [t.idPersona, t.posicion, t.puntosTotales])).toEqual([[3, 1, 37], [4, 1, 37], [5, 3, 36]]);
    });

    it("entre iguales en puntos y victorias, gana el de más segundos", async () => {
        // 9: 1° + 2° + 4° = 25 + 18 + 12 = 55 · 10: 1° + 3° + 3° = 25 + 15 + 15 = 55
        const tabla = await conTabla([
            part(10, 1), part(10, 3), part(10, 3),
            part(9, 1), part(9, 2), part(9, 4),
        ]);

        expect(tabla.map(t => [t.idPersona, t.posicion, t.victorias])).toEqual([[9, 1, 1], [10, 2, 1]]);
    });

    it("devuelve 404 si el torneo no existe", async () => {
        db.torneos = { findUnique: jest.fn(async () => null) };

        await expect(participacionService.getTablaGeneral(99)).rejects.toMatchObject({ statusCode: 404 });
    });
});

describe("clasificación de una carrera", () => {
    it("devuelve los resultados ordenados con el nombre del piloto", async () => {
        db.participaciones.findMany = jest.fn(async () => [
            { posicion_final: 1, Personas_idPersona: 4, tiempo: "00:18:20", puntos: 25, personas: { nombre: "Ana", apellido: "Gómez" } },
        ]);

        const clasificacion = await participacionService.getClasificacionCarrera(CLAVES);

        expect(db.participaciones.findMany.mock.calls[0][0].orderBy).toEqual({ posicion_final: "asc" });
        expect(clasificacion).toEqual([{ posicion: 1, idPersona: 4, nombre: "Ana", apellido: "Gómez", tiempo: "00:18:20", puntos: 25 }]);
    });

    it("devuelve 404 si la carrera no existe", async () => {
        db.carreras.findUnique = jest.fn(async () => null);

        await expect(participacionService.getClasificacionCarrera(CLAVES)).rejects.toMatchObject({ statusCode: 404 });
    });
});
