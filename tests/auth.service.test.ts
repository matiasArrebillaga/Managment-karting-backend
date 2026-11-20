
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import authService from "../src/entities/auth/auth.service";

const db = prisma as unknown as Record<string, any>;

//PersonaMock representa un objeto "ficticio" para no depender de la bases de datos real de Karting.
const personaMock = {
    idPersona: 1,
    nombre: "Juan",
    apellido: "Perez",
    mail: "juan@mail.com",
    contraseña: "hash-de-la-contraseña",
    rol: {
        nombre: "CLIENTE"
    }
};

beforeEach(() => {
    jest.clearAllMocks();

    db.personas = {
        findUnique: jest.fn(async () => null)
    };
});

describe("login", () => {

    it("busca por mail unico, sin espacios y en minusculas", async () => {
        await expect(
            authService.login({
                mail: "  Juan@Mail.COM ",
                contraseña: "x"
            })
        ).rejects.toThrow("Credenciales invalidas");

        expect(db.personas.findUnique.mock.calls[0][0].where)
            .toEqual({ mail: "juan@mail.com" });
    });

    it("rechaza el login si la persona no existe", async () => {
    db.personas.findUnique.mockResolvedValue(null);

    const compareSpy = jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(async () => true);

    await expect(
        authService.login({
            mail: "inexistente@mail.com",
            contraseña: "123456"
        })
    ).rejects.toThrow("Credenciales invalidas");

    expect(compareSpy).not.toHaveBeenCalled();

    compareSpy.mockRestore();
     });

    it("rechaza el login si la contraseña es incorrecta", async () => {
        db.personas.findUnique.mockResolvedValue(personaMock);

        const compareSpy = jest
            .spyOn(bcrypt, "compare")
            .mockImplementation(async () => false);

        await expect(
            authService.login({
                mail: "juan@mail.com",
                contraseña: "incorrecta"
            })
        ).rejects.toThrow("Credenciales invalidas");

        expect(compareSpy).toHaveBeenCalledWith(
            "incorrecta",
            personaMock.contraseña
        );

        compareSpy.mockRestore();
    });

    it("genera un JWT válido cuando las credenciales son correctas", async () => {
        db.personas.findUnique.mockResolvedValue(personaMock);

        const compareSpy = jest
            .spyOn(bcrypt, "compare")
            .mockImplementation(async () => true);

        const resultado = await authService.login({
            mail: "juan@mail.com",
            contraseña: "123456"
        });

        expect(compareSpy).toHaveBeenCalledWith(
            "123456",
            personaMock.contraseña
        );

        // Verifica la firma y decodifica el contenido del token.
        const payload = jwt.verify(
            resultado.token,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;

        expect(payload.idPersona).toBe(1);
        expect(payload.mail).toBe("juan@mail.com");
        expect(payload.rol).toBe("CLIENTE");

        // Comprueba que la contraseña no se devuelva.
        expect(resultado.persona).not.toHaveProperty("contraseña");

        expect(resultado.persona.idPersona).toBe(1);

        compareSpy.mockRestore();
    });
});
