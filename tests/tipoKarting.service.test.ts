
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import tiposKartingService from "../src/entities/tipoKarting/tiposKarting.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.tiposlicencias = {
        findUnique: jest.fn(async () => ({ idTipoLicencia: 1 }))
    };

    db.tiposkarting = {
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

describe("seguridad de tipo de karting", () => {
    it("create ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: "Karting adulto",
            descripcion: "Karting de uso general",
            precioHora: 10000,
            TiposLicencias_idTipoLicenciaMinima: 1,
            idTiposKarting: 999,
            kartings: { create: [{}] }
        };

        await tiposKartingService.create(datosMaliciosos as any);

        const datosEnviados = db.tiposkarting.create.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            nombre: "Karting adulto",
            descripcion: "Karting de uso general",
            precioHora: 10000,
            TiposLicencias_idTipoLicenciaMinima: 1
        });
        expect(datosEnviados).not.toHaveProperty("idTiposKarting");
        expect(datosEnviados).not.toHaveProperty("kartings");
    });

    it("update ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: "Karting actualizado",
            descripcion: "Descripción actualizada",
            TiposLicencias_idTipoLicenciaMinima: 1,
            idTiposKarting: 999,
            precioHora: 50000,
            kartings: { create: [{}] }
        };

        await tiposKartingService.update(1, datosMaliciosos as any);

        const datosEnviados = db.tiposkarting.update.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({
            nombre: "Karting actualizado",
            descripcion: "Descripción actualizada",
            TiposLicencias_idTipoLicenciaMinima: 1
        });
        expect(datosEnviados).not.toHaveProperty("idTiposKarting");
        expect(datosEnviados).not.toHaveProperty("precioHora");
        expect(datosEnviados).not.toHaveProperty("kartings");
    });
});
