
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import rolService from "../src/entities/rol/rol.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.roles = {
        findMany: jest.fn(async () => []),
        findUnique: jest.fn(async () => null)
    };
});

describe("RolService", () => {

    describe("getAll", () => {
        it("devuelve todos los roles", async () => {
            const rolesMock = [
                { idRol: 1, nombre: "ADMIN" },
                { idRol: 2, nombre: "EMPLEADO" },
                { idRol: 3, nombre: "CLIENTE" }
            ];

            db.roles.findMany.mockResolvedValue(rolesMock);

            const resultado = await rolService.getAll();

            expect(resultado).toEqual(rolesMock);
            expect(db.roles.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("getById", () => {
        it("devuelve un rol cuando existe", async () => {
            const rolMock = { idRol: 1, nombre: "ADMIN" };

            db.roles.findUnique.mockResolvedValue(rolMock);

            const resultado = await rolService.getById(1);

            expect(resultado).toEqual(rolMock);
            expect(db.roles.findUnique).toHaveBeenCalledWith({
                where: { idRol: 1 }
            });
        });

        it("devuelve null cuando el rol no existe", async () => {
            db.roles.findUnique.mockResolvedValue(null);

            const resultado = await rolService.getById(999);

            expect(resultado).toBeNull();
        });

        it("rechaza un ID inválido", async () => {
            await expect(
                rolService.getById(0)
            ).rejects.toThrow();

            expect(db.roles.findUnique).not.toHaveBeenCalled();
        });
    });
});
