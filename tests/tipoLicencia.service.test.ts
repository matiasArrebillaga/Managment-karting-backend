
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import tiposLicenciasService from "../src/entities/tipoLicencia/tiposLicencias.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.tiposlicencias = {
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

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
