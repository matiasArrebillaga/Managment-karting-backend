import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import personaService from "../src/entities/persona/persona.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    db.roles = { findFirst: jest.fn(async () => ({ idRol: 3, nombre: "ADMIN" })) };
    db.personas = { update: jest.fn(async ({ data }: any) => data) };
});

describe("asignarRol", () => {
    it.each([undefined, "", "  "])("rechaza nombreRol %p en vez de asignar el primer rol", async (nombreRol) => {
        await expect(personaService.asignarRol(1, nombreRol as string)).rejects.toThrow(/nombreRol es obligatorio/);
        expect(db.personas.update).not.toHaveBeenCalled();
    });

    it("asigna el rol pedido sin devolver la contraseña", async () => {
        await personaService.asignarRol(1, "ADMIN");

        expect(db.roles.findFirst.mock.calls[0][0]).toEqual({ where: { nombre: "ADMIN" } });
        expect(db.personas.update.mock.calls[0][0].omit).toEqual({ contraseña: true });
    });
});
