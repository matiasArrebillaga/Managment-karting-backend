
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import tiposLicenciasService from "../src/entities/tipoLicencia/tiposLicencias.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.tiposlicencias = {
        findMany: jest.fn(async () => []),
        findUnique: jest.fn(async () => null),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data),
        delete: jest.fn(async ({ where }: any) => where)
    };
});

// GET ALL
describe("getAll", () => {
    it("devuelve todos los tipos de licencia", async () => {
        const licenciasMock = [
            { idTipoLicencia: 1, nombre: "Principiante", nivel: 1 },
            { idTipoLicencia: 2, nombre: "Profesional", nivel: 3 }
        ];

        db.tiposlicencias.findMany.mockResolvedValue(licenciasMock);

        const resultado = await tiposLicenciasService.getAll();

        expect(resultado).toEqual(licenciasMock);
        expect(db.tiposlicencias.findMany).toHaveBeenCalledTimes(1);
    });
});

// GET BY ID
describe("getById", () => {
    it("devuelve un tipo de licencia cuando existe", async () => {
        const licenciaMock = {
            idTipoLicencia: 1,
            nombre: "Principiante",
            nivel: 1
        };

        db.tiposlicencias.findUnique.mockResolvedValue(licenciaMock);

        const resultado = await tiposLicenciasService.getById(1);

        expect(resultado).toEqual(licenciaMock);
        expect(db.tiposlicencias.findUnique).toHaveBeenCalledWith({
            where: { idTipoLicencia: 1 }
        });
    });

    it("devuelve null cuando el tipo de licencia no existe", async () => {
        db.tiposlicencias.findUnique.mockResolvedValue(null);

        const resultado = await tiposLicenciasService.getById(999);

        expect(resultado).toBeNull();
    });

    it("rechaza un ID inválido", async () => {
        await expect(
            tiposLicenciasService.getById(0)
        ).rejects.toThrow();

        expect(db.tiposlicencias.findUnique).not.toHaveBeenCalled();
    });
});

// CREATE
describe("seguridad de tipo de licencia", () => {
    it("create ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: "Profesional",
            descripcion: "Licencia profesional",
            nivel: 3,
            idTipoLicencia: 999,
            personas: { create: [{}] }
        };

        await tiposLicenciasService.create(datosMaliciosos as any);

        const datosEnviados = db.tiposlicencias.create.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            nombre: "Profesional",
            descripcion: "Licencia profesional",
            nivel: 3
        });

        expect(datosEnviados).not.toHaveProperty("idTipoLicencia");
        expect(datosEnviados).not.toHaveProperty("personas");
    });

    it("update ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: "Principiante",
            nivel: 1,
            idTipoLicencia: 999,
            personas: { create: [{}] }
        };

        await tiposLicenciasService.update(1, datosMaliciosos as any);

        const datosEnviados = db.tiposlicencias.update.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            nombre: "Principiante",
            nivel: 1
        });

        expect(datosEnviados).not.toHaveProperty("idTipoLicencia");
        expect(datosEnviados).not.toHaveProperty("personas");
    });
});

// UPDATE
describe("update", () => {
    it("rechaza un ID inválido", async () => {
        await expect(
            tiposLicenciasService.update(0, { nombre: "Nuevo" })
        ).rejects.toThrow();

        expect(db.tiposlicencias.update).not.toHaveBeenCalled();
    });
});

// DELETE
describe("delete", () => {
    it("elimina un tipo de licencia por su ID", async () => {
        await tiposLicenciasService.delete(1);

        expect(db.tiposlicencias.delete).toHaveBeenCalledWith({
            where: { idTipoLicencia: 1 }
        });
    });

    it("rechaza un ID inválido", async () => {
        await expect(
            tiposLicenciasService.delete(0)
        ).rejects.toThrow();

        expect(db.tiposlicencias.delete).not.toHaveBeenCalled();
    });
});
