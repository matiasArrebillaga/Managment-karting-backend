
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import personaService from "../src/entities/persona/persona.service";

const db = prisma as unknown as Record<string, any>;

beforeEach(() => {
    jest.clearAllMocks();

    db.roles = {
        findFirst: jest.fn(async () => ({ idRol: 3, nombre: "ADMIN" }))
    };

    db.personas = {
        update: jest.fn(async ({ data }: any) => data)
    };
});

describe("asignarRol", () => {
    it.each([undefined, "", "  "])(
        "rechaza nombreRol %p en vez de asignar el primer rol",
        async (nombreRol) => {
            await expect(
                personaService.asignarRol(1, nombreRol as string)
            ).rejects.toThrow(/nombreRol es obligatorio/);

            expect(db.personas.update).not.toHaveBeenCalled();
        }
    );

    it("asigna el rol pedido sin devolver la contraseña", async () => {
        await personaService.asignarRol(1, "ADMIN");

        expect(db.roles.findFirst.mock.calls[0][0]).toEqual({
            where: { nombre: "ADMIN" }
        });

        expect(db.personas.update.mock.calls[0][0].omit).toEqual({
            contraseña: true
        });
    });
});

describe("validacion de mail y contraseña", () => {
    const valida = {
        nombre: "Juan",
        apellido: "Perez",
        dni: "12345678",
        fechaNacimiento: new Date("1990-01-01"),
        mail: "juan@mail.com",
        telefono: "1122334455",
        contraseña: "12345678",
        Localidades_idLocalidades: 1
    };

    it.each([
        "hola",
        "juan@",
        "@mail.com",
        "juan@mail",
        "juan perez@mail.com"
    ])("rechaza el mail %p", async (mail) => {
        await expect(
            personaService.create({ ...valida, mail })
        ).rejects.toThrow(/mail no tiene un formato válido/);
    });

    it.each(["", "a", "1234567"])(
        "rechaza la contraseña %p por corta",
        async (contraseña) => {
            await expect(
                personaService.create({ ...valida, contraseña })
            ).rejects.toThrow(/entre 8 y 255/);
        }
    );

    it("no permite crear reservas enviadas en los datos del registro", async () => {
        db.localidades = {
            findUnique: jest.fn(async () => ({ idLocalidades: 1 }))
        };

        db.tiposlicencias = {
            findFirst: jest.fn(async () => ({
                idTipoLicencia: 1,
                nivel: 1
            }))
        };

        db.personas.findFirst = jest.fn(async () => null);
        db.personas.create = jest.fn(async ({ data }: any) => data);

        const datosMaliciosos = {
            ...valida,
            reservas: {
                create: [{}]
            }
        };

        await personaService.create(datosMaliciosos as any);

        const datosEnviados = db.personas.create.mock.calls[0][0].data;

        expect(datosEnviados).not.toHaveProperty("reservas");
    });

    it("el cliente nuevo recibe la licencia de menor nivel por 1 año; el empleado no", async () => {
        db.localidades = {
            findUnique: jest.fn(async () => ({ idLocalidades: 1 }))
        };

        db.tiposlicencias = {
            findFirst: jest.fn(async () => ({
                idTipoLicencia: 1,
                nivel: 1
            }))
        };

        db.personas.findFirst = jest.fn(async () => null);
        db.personas.create = jest.fn(async ({ data }: any) => data);

        await personaService.create(valida);

        const licencia = db.personas.create.mock.calls[0][0].data.licencias.create;

        expect(db.tiposlicencias.findFirst.mock.calls[0][0]).toEqual({
            orderBy: { nivel: "asc" }
        });

        expect(licencia.TiposLicencias_idTipoLicencia).toBe(1);

        expect(licencia.fechaVencimiento.getFullYear()).toBe(
            licencia.fechaEmision.getFullYear() + 1
        );

        await personaService.crearEmpleado(valida);

        expect(db.personas.create.mock.calls[1][0].data.licencias).toBeUndefined();
    });

    it("en el update tambien valida el mail", async () => {
        await expect(
            personaService.update(1, { mail: "hola" })
        ).rejects.toThrow(/mail no tiene un formato válido/);

        expect(db.personas.update).not.toHaveBeenCalled();
    });

    it("el update no devuelve la contraseña", async () => {
        await personaService.update(1, { nombre: "Juan" });

        expect(db.personas.update.mock.calls[0][0].omit).toEqual({
            contraseña: true
        });
    });
});
