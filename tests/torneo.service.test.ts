import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import torneoService from "../src/entities/torneos/torneo.service";
import { hoyUTC } from "../src/utils/fecha";

const db = prisma as unknown as Record<string, any>;

const DIA = 24 * 60 * 60 * 1000;
const hoy = hoyUTC();
const enDias = (n: number) => new Date(hoy.getTime() + n * DIA);

const TORNEOS = [
    { idTorneos: 1, fechaInicio: enDias(-30), fechaFin: enDias(-1) },
    { idTorneos: 2, fechaInicio: enDias(-1), fechaFin: hoy },      // termina hoy: sigue en curso
    { idTorneos: 3, fechaInicio: hoy, fechaFin: enDias(10) },     // empieza hoy: ya en curso
    { idTorneos: 4, fechaInicio: enDias(1), fechaFin: enDias(30) },
];

beforeEach(() => {
    db.torneos = {
        findMany: jest.fn(async () => TORNEOS),
        findUnique: jest.fn(async () => TORNEOS[3]),
    };
});

describe("estado del torneo", () => {
    it("lo deriva de las fechas contra el día de hoy", async () => {
        const torneos = await torneoService.getAll();

        expect(torneos.map(t => t.estado)).toEqual(["finalizado", "en_curso", "en_curso", "proximo"]);
    });

    it("también en getById", async () => {
        expect((await torneoService.getById(4))?.estado).toBe("proximo");
    });

    it("filtra en la query por estado", async () => {
        await torneoService.getAll("en_curso");

        expect(db.torneos.findMany.mock.calls[0][0].where).toEqual({ fechaInicio: { lte: hoy }, fechaFin: { gte: hoy } });
    });

    it("rechaza un estado desconocido", async () => {
        await expect(torneoService.getAll("xx")).rejects.toThrow("El estado debe ser uno de");
        expect(db.torneos.findMany).not.toHaveBeenCalled();
    });
});
