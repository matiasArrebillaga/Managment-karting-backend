import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import authService from "../src/entities/auth/auth.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    db.personas = { findUnique: jest.fn(async () => null) };
});

describe("login", () => {
    it("busca por mail unico, sin espacios y en minusculas", async () => {
        await expect(authService.login({ mail: "  Juan@Mail.COM ", contraseña: "x" }))
            .rejects.toThrow("Credenciales invalidas");

        expect(db.personas.findUnique.mock.calls[0][0].where).toEqual({ mail: "juan@mail.com" });
    });
});
