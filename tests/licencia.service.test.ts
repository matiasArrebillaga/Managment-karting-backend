
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import licenciaService from "../src/entities/licencia/licencia.service";

const db = prisma as unknown as Record<string, any>;

const FECHA_EMISION = "2025-01-01";
const FECHA_VENCIMIENTO = "2027-01-01";

beforeEach(() => {
    jest.clearAllMocks();

    db.personas = {
        findUnique: jest.fn(async () => ({ idPersona: 1 }))
    };

    db.tiposlicencias = {
        findUnique: jest.fn(async () => ({ idTipoLicencia: 1 }))
    };

    db.licencias = {
        findMany: jest.fn(),
        findUnique: jest.fn(async () => ({
            idLicencias: 1,
            Personas_idPersona: 1,
            TiposLicencias_idTipoLicencia: 1,
            fechaEmision: new Date(FECHA_EMISION),
            fechaVencimiento: new Date(FECHA_VENCIMIENTO)
        })),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data),
        delete: jest.fn()
    };
});

const licenciaValida = {
    Personas_idPersona: 1,
    TiposLicencias_idTipoLicencia: 1,
    fechaEmision: FECHA_EMISION,
    fechaVencimiento: FECHA_VENCIMIENTO
};

// GET ALL
describe("getAll", () => {
    it("devuelve todas las licencias", async () => {
        const licencias = [
            { idLicencias: 1, Personas_idPersona: 1 },
            { idLicencias: 2, Personas_idPersona: 2 }
        ];

        db.licencias.findMany.mockResolvedValue(licencias);

        const resultado = await licenciaService.getAll();

        expect(resultado).toEqual(licencias);
        expect(db.licencias.findMany).toHaveBeenCalled();
    });
});

// GET POR PERSONA
describe("getPorPersona", () => {
    it("devuelve las licencias de una persona", async () => {
        const licencias = [
            { idLicencias: 1, Personas_idPersona: 1 }
        ];

        db.licencias.findMany.mockResolvedValue(licencias);

        const resultado = await licenciaService.getPorPersona(1);

        expect(resultado).toEqual(licencias);

        expect(db.licencias.findMany).toHaveBeenCalledWith({
            where: { Personas_idPersona: 1 },
            include: { tiposlicencias: true },
            orderBy: { fechaVencimiento: "desc" }
        });
    });

    it("devuelve una lista vacía si la persona no tiene licencias", async () => {
        db.licencias.findMany.mockResolvedValue([]);

        const resultado = await licenciaService.getPorPersona(1);

        expect(resultado).toEqual([]);
    });

    it("rechaza un identificador inválido", async () => {
        await expect(
            licenciaService.getPorPersona(0)
        ).rejects.toThrow();
    });
});

// GET BY ID
describe("getById", () => {
    it("devuelve una licencia existente", async () => {
        const licencia = {
            idLicencias: 1,
            Personas_idPersona: 1
        };

        db.licencias.findUnique.mockResolvedValue(licencia);

        const resultado = await licenciaService.getById(1);

        expect(resultado).toEqual(licencia);

        expect(db.licencias.findUnique).toHaveBeenCalledWith({
            where: { idLicencias: 1 }
        });
    });

    it("devuelve null si la licencia no existe", async () => {
        db.licencias.findUnique.mockResolvedValue(null);

        const resultado = await licenciaService.getById(999);

        expect(resultado).toBeNull();
    });

    it("rechaza un identificador inválido", async () => {
        await expect(
            licenciaService.getById(0)
        ).rejects.toThrow();
    });
});

// CREATE
describe("create", () => {
    it("crea una licencia correctamente", async () => {
        const resultado = await licenciaService.create(licenciaValida);

        expect(resultado).toEqual({
            Personas_idPersona: 1,
            TiposLicencias_idTipoLicencia: 1,
            fechaEmision: new Date(FECHA_EMISION),
            fechaVencimiento: new Date(FECHA_VENCIMIENTO)
        });

        expect(db.personas.findUnique).toHaveBeenCalledWith({
            where: { idPersona: 1 }
        });

        expect(db.tiposlicencias.findUnique).toHaveBeenCalledWith({
            where: { idTipoLicencia: 1 }
        });

        expect(db.licencias.create).toHaveBeenCalled();
    });

    it("rechaza la creación si la persona no existe", async () => {
        db.personas.findUnique.mockResolvedValue(null);

        await expect(
            licenciaService.create(licenciaValida)
        ).rejects.toThrow("La persona ingresada no existe");

        expect(db.licencias.create).not.toHaveBeenCalled();
    });

    it("rechaza la creación si el tipo de licencia no existe", async () => {
        db.tiposlicencias.findUnique.mockResolvedValue(null);

        await expect(
            licenciaService.create(licenciaValida)
        ).rejects.toThrow("El tipo de licencia ingresado no existe");

        expect(db.licencias.create).not.toHaveBeenCalled();
    });

    it("ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            ...licenciaValida,
            idLicencias: 999,
            personas: { connect: { idPersona: 999 } }
        };

        await licenciaService.create(datosMaliciosos as any);

        const datosEnviados = db.licencias.create.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            Personas_idPersona: 1,
            TiposLicencias_idTipoLicencia: 1,
            fechaEmision: new Date(FECHA_EMISION),
            fechaVencimiento: new Date(FECHA_VENCIMIENTO)
        });

        expect(datosEnviados).not.toHaveProperty("idLicencias");
        expect(datosEnviados).not.toHaveProperty("personas");
    });
});

// UPDATE
describe("update", () => {
    it("actualiza una licencia correctamente", async () => {
        const datos = {
            fechaVencimiento: "2028-01-01"
        };

        const resultado = await licenciaService.update(1, datos);

        expect(resultado).toEqual({
            fechaVencimiento: new Date("2028-01-01")
        });

        expect(db.licencias.update).toHaveBeenCalledWith({
            where: { idLicencias: 1 },
            data: {
                fechaVencimiento: new Date("2028-01-01")
            }
        });
    });

    it("rechaza un identificador inválido", async () => {
        await expect(
            licenciaService.update(0, { fechaVencimiento: "2028-01-01" })
        ).rejects.toThrow();
    });

    it("rechaza la actualización si la licencia no existe", async () => {
        db.licencias.findUnique.mockResolvedValue(null);

        await expect(
            licenciaService.update(1, { fechaVencimiento: "2028-01-01" })
        ).rejects.toThrow("La licencia ingresada no existe");

        expect(db.licencias.update).not.toHaveBeenCalled();
    });

    it("rechaza la actualización si la persona ingresada no existe", async () => {
        db.personas.findUnique.mockResolvedValue(null);

        await expect(
            licenciaService.update(1, { Personas_idPersona: 999 })
        ).rejects.toThrow("La persona ingresada no existe");

        expect(db.licencias.update).not.toHaveBeenCalled();
    });

    it("rechaza la actualización si el tipo de licencia no existe", async () => {
        db.tiposlicencias.findUnique.mockResolvedValue(null);

        await expect(
            licenciaService.update(1, { TiposLicencias_idTipoLicencia: 999 })
        ).rejects.toThrow("El tipo de licencia ingresado no existe");

        expect(db.licencias.update).not.toHaveBeenCalled();
    });

    it("ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            fechaVencimiento: "2028-01-01",
            idLicencias: 999,
            personas: { connect: { idPersona: 999 } }
        };

        await licenciaService.update(1, datosMaliciosos as any);

        const datosEnviados = db.licencias.update.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            fechaVencimiento: new Date("2028-01-01")
        });

        expect(datosEnviados).not.toHaveProperty("idLicencias");
        expect(datosEnviados).not.toHaveProperty("personas");
    });
});

// DELETE
describe("delete", () => {
    it("elimina una licencia correctamente", async () => {
        const eliminada = { idLicencias: 1 };

        db.licencias.delete.mockResolvedValue(eliminada);

        const resultado = await licenciaService.delete(1);

        expect(resultado).toEqual(eliminada);

        expect(db.licencias.delete).toHaveBeenCalledWith({
            where: { idLicencias: 1 }
        });
    });

    it("rechaza un identificador inválido", async () => {
        await expect(
            licenciaService.delete(0)
        ).rejects.toThrow();
    });
});
