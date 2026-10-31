
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import rolService from "../src/entities/rol/rol.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.roles = {
        findFirst: jest.fn(async () => null),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data)
    };
});

describe("seguridad de rol", () => {
    it("create ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: "EMPLEADO",
            idRol: 999,
            personas: { create: [{}] }
        };

        await rolService.create(datosMaliciosos as any);

        const datosEnviados = db.roles.create.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({ nombre: "EMPLEADO" });
        expect(datosEnviados).not.toHaveProperty("idRol");
        expect(datosEnviados).not.toHaveProperty("personas");
    });

    it("update ignora los campos no permitidos", async () => {
        const datosMaliciosos = {
            nombre: "ADMIN",
            idRol: 999,
            personas: { create: [{}] }
        };

        await rolService.update(1, datosMaliciosos as any);

        const datosEnviados = db.roles.update.mock.calls[0][0].data;

        expect(datosEnviados).toEqual({ nombre: "ADMIN" });
        expect(datosEnviados).not.toHaveProperty("idRol");
        expect(datosEnviados).not.toHaveProperty("personas");
    });
});
