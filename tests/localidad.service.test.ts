
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import localidadService from "../src/entities/localidad/localidad.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.localidades = {
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

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
