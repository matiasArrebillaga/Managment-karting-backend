
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
        findUnique: jest.fn(async () => ({
            idLicencias: 1,
            Personas_idPersona: 1,
            TiposLicencias_idTipoLicencia: 1,
            fechaEmision: new Date(FECHA_EMISION),
            fechaVencimiento: new Date(FECHA_VENCIMIENTO)
        })),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

const licenciaValida = {
    Personas_idPersona: 1,
    TiposLicencias_idTipoLicencia: 1,
    fechaEmision: FECHA_EMISION,
    fechaVencimiento: FECHA_VENCIMIENTO
};

describe("seguridad de licencia", () => {
    it("create ignora los campos no permitidos", async () => {
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

    it("update ignora los campos no permitidos", async () => {
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
