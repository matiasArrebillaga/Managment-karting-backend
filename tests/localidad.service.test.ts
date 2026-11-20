

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import localidadService from "../src/entities/localidad/localidad.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.localidades = {
        findMany: jest.fn(async () => []),
        findUnique: jest.fn(async () => null),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data),
        delete: jest.fn(async ({ where }: any) => where)
    };
});

// GET ALL
describe("getAll", () => {
    it("devuelve todas las localidades", async () => {
        const localidadesMock = [
            { idLocalidades: 1, nombre: "Rosario" },
            { idLocalidades: 2, nombre: "Funes" }
        ];

        db.localidades.findMany.mockResolvedValue(localidadesMock);

        const resultado = await localidadService.getAll();

        expect(resultado).toEqual(localidadesMock);
        expect(db.localidades.findMany).toHaveBeenCalledTimes(1);
    });
});

// GET BY ID
describe("getById", () => {
    it("devuelve una localidad cuando existe", async () => {
        const localidadMock = {
            idLocalidades: 1,
            nombre: "Rosario"
        };

        db.localidades.findUnique.mockResolvedValue(localidadMock);

        const resultado = await localidadService.getById(1);

        expect(resultado).toEqual(localidadMock);
        expect(db.localidades.findUnique).toHaveBeenCalledWith({
            where: { idLocalidades: 1 }
        });
    });

    it("devuelve null cuando la localidad no existe", async () => {
        db.localidades.findUnique.mockResolvedValue(null);

        const resultado = await localidadService.getById(999);

        expect(resultado).toBeNull();
    });

    it("rechaza un ID inválido", async () => {
        await expect(
            localidadService.getById(0)
        ).rejects.toThrow();

        expect(db.localidades.findUnique).not.toHaveBeenCalled();
    });
});

// CREATE Y UPDATE: SEGURIDAD
describe("seguridad de localidad", () => {
    it("create ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: " Rosario ",
            idLocalidades: 999,
            personas: { create: [{}] }
        };

        await localidadService.create(datosMaliciosos as any);

        const datosEnviados = db.localidades.create.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({ nombre: "Rosario" });
        expect(datosEnviados).not.toHaveProperty("idLocalidades");
        expect(datosEnviados).not.toHaveProperty("personas");
    });

    it("update ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: " Rosario ",
            idLocalidades: 999,
            personas: { create: [{}] }
        };

        await localidadService.update(1, datosMaliciosos as any);

        const datosEnviados = db.localidades.update.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({ nombre: "Rosario" });
        expect(datosEnviados).not.toHaveProperty("idLocalidades");
        expect(datosEnviados).not.toHaveProperty("personas");
    });
});

// UPDATE
describe("update", () => {
    it("rechaza un ID inválido", async () => {
        await expect(
            localidadService.update(0, { nombre: "Nueva localidad" })
        ).rejects.toThrow();

        expect(db.localidades.update).not.toHaveBeenCalled();
    });
});

// DELETE
describe("delete", () => {
    it("elimina una localidad por su ID", async () => {
        await localidadService.delete(1);

        expect(db.localidades.delete).toHaveBeenCalledWith({
            where: { idLocalidades: 1 }
        });
    });

    it("rechaza un ID inválido", async () => {
        await expect(
            localidadService.delete(0)
        ).rejects.toThrow();

        expect(db.localidades.delete).not.toHaveBeenCalled();
    });
});
