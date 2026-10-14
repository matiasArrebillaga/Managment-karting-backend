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
    { idTorneos: 4, fechaInicio: enDias(1), fechaFin: enDias(30), TiposLicencias_idTipoLicencia: 1 },
];

beforeEach(() => {
    db.torneos = {
        findMany: jest.fn(async () => TORNEOS),
        findUnique: jest.fn(async () => TORNEOS[3]),
        create: jest.fn(async (args: any) => args.data),
        update: jest.fn(async (args: any) => args.data),
    };
    // existen las licencias 1 y 2
    db.tiposlicencias = {
        findUnique: jest.fn(async ({ where }: any) => [1, 2].includes(where.idTipoLicencia) ? { idTipoLicencia: where.idTipoLicencia } : null),
    };
    db.carreras = { count: jest.fn(async () => 0) };
});

const torneoNuevo = (licencia: number) => ({
    nombre: "Copa", descripcion: "Abierta", cupoMaximo: 8,
    fechaInicio: "2099-11-01", fechaFin: "2099-11-30", TiposLicencias_idTipoLicencia: licencia
});

describe("tipo de licencia del torneo", () => {
    it("crea el torneo con su licencia", async () => {
        await torneoService.create(torneoNuevo(2));

        expect(db.torneos.create.mock.calls[0][0].data.TiposLicencias_idTipoLicencia).toBe(2);
    });

    it("rechaza una licencia que no existe", async () => {
        await expect(torneoService.create(torneoNuevo(99))).rejects.toThrow("El tipo de licencia ingresado no existe");
        expect(db.torneos.create).not.toHaveBeenCalled();
    });

    it("permite cambiar la licencia si el torneo no tiene carreras", async () => {
        await torneoService.update(4, { TiposLicencias_idTipoLicencia: 2 });

        expect(db.torneos.update.mock.calls[0][0].data.TiposLicencias_idTipoLicencia).toBe(2);
    });

    it("no permite cambiar la licencia si el torneo ya tiene carreras", async () => {
        db.carreras.count = jest.fn(async () => 3);

        await expect(torneoService.update(4, { TiposLicencias_idTipoLicencia: 2 }))
            .rejects.toThrow("el torneo ya tiene carreras");
        expect(db.torneos.update).not.toHaveBeenCalled();
    });
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

describe("update del torneo", () => {
    it("convierte las fechas que llegan como string", async () => {
        await torneoService.update(4, { fechaInicio: "2099-11-01", fechaFin: "2099-11-30" });

        const data = db.torneos.update.mock.calls[0][0].data;
        expect(data.fechaInicio).toEqual(new Date("2099-11-01"));
        expect(data.fechaFin).toEqual(new Date("2099-11-30"));
    });

    it("rechaza una fecha invalida", async () => {
        await expect(torneoService.update(4, { fechaInicio: "hola" })).rejects.toThrow("La fecha de inicio no es válida");
        expect(db.torneos.update).not.toHaveBeenCalled();
    });
});

describe("filtro por tipo de licencia", () => {
    it("filtra en la query por licencia e incluye el tipo de licencia", async () => {
        await torneoService.getAll(undefined, 2);

        const args = db.torneos.findMany.mock.calls[0][0];
        expect(args.where).toEqual({ TiposLicencias_idTipoLicencia: 2 });
        expect(args.include).toEqual({ tiposlicencias: true });
    });

    it("combina el filtro de licencia con el de estado", async () => {
        await torneoService.getAll("proximo", 1);

        expect(db.torneos.findMany.mock.calls[0][0].where)
            .toEqual({ fechaInicio: { gt: hoy }, TiposLicencias_idTipoLicencia: 1 });
    });

    it("rechaza una licencia que no es un entero", async () => {
        await expect(torneoService.getAll(undefined, NaN)).rejects.toThrow("El tipo de licencia debe ser un número entero");
        expect(db.torneos.findMany).not.toHaveBeenCalled();
    });
});
