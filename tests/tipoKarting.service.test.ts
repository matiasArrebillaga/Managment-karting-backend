
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
        findMany: jest.fn(async () => []),
        findUnique: jest.fn(async () => null),
        create: jest.fn(async ({ data }: any) => data),
        update: jest.fn(async ({ data }: any) => data),
        delete: jest.fn(async ({ where }: any) => where)
    };

    db.carreras_kartings = {
        findMany: jest.fn(async () => [])
    };
});

describe("TiposKartingService", () => {

    // GET ALL
    describe("getAll", () => {
        it("devuelve todos los tipos de karting", async () => {
            const tiposMock = [
                { idTiposKarting: 1, nombre: "Adultos" },
                { idTiposKarting: 2, nombre: "Infantiles" }
            ];

            db.tiposkarting.findMany.mockResolvedValue(tiposMock);

            const resultado = await tiposKartingService.getAll();

            expect(resultado).toEqual(tiposMock);
            expect(db.tiposkarting.findMany).toHaveBeenCalledTimes(1);
        });
    });

    // GET BY ID
    describe("getById", () => {
        it("devuelve un tipo de karting cuando existe", async () => {
            const tipoMock = { idTiposKarting: 1, nombre: "Adultos" };

            db.tiposkarting.findUnique.mockResolvedValue(tipoMock);

            const resultado = await tiposKartingService.getById(1);

            expect(resultado).toEqual(tipoMock);
            expect(db.tiposkarting.findUnique).toHaveBeenCalledWith({
                where: { idTiposKarting: 1 }
            });
        });

        it("devuelve null cuando el tipo no existe", async () => {
            db.tiposkarting.findUnique.mockResolvedValue(null);

            const resultado = await tiposKartingService.getById(999);

            expect(resultado).toBeNull();
        });

        it("rechaza un ID inválido", async () => {
            await expect(
                tiposKartingService.getById(0)
            ).rejects.toThrow();

            expect(db.tiposkarting.findUnique).not.toHaveBeenCalled();
        });
    });

    // CREATE
    describe("create", () => {
        it("ignora los campos no permitidos", async () => {
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

        it("rechaza una licencia mínima inexistente", async () => {
            db.tiposlicencias.findUnique.mockResolvedValue(null);

            await expect(
                tiposKartingService.create({
                    nombre: "Adultos",
                    descripcion: "Karting adulto",
                    precioHora: 10000,
                    TiposLicencias_idTipoLicenciaMinima: 999
                } as any)
            ).rejects.toThrow("La licencia mínima ingresada no existe");

            expect(db.tiposkarting.create).not.toHaveBeenCalled();
        });
    });

    // UPDATE
    describe("update", () => {
        it("ignora los campos no permitidos", async () => {
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
                precioHora: 50000,
                TiposLicencias_idTipoLicenciaMinima: 1
            });

            expect(datosEnviados).not.toHaveProperty("idTiposKarting");
            expect(datosEnviados).not.toHaveProperty("kartings");
        });

        it("rechaza un ID inválido", async () => {
            await expect(
                tiposKartingService.update(0, { nombre: "Nuevo" })
            ).rejects.toThrow();

            expect(db.tiposkarting.update).not.toHaveBeenCalled();
        });

        it("rechaza una licencia mínima inexistente", async () => {
            db.tiposlicencias.findUnique.mockResolvedValue(null);

            await expect(
                tiposKartingService.update(1, {
                    TiposLicencias_idTipoLicenciaMinima: 999
                })
            ).rejects.toThrow("La licencia mínima ingresada no existe");

            expect(db.tiposkarting.update).not.toHaveBeenCalled();
        });

        it("rechaza el cambio si algún kart corre en un torneo de otra licencia", async () => {
            db.carreras_kartings.findMany = jest.fn(async () => [
                { carreras: { torneos: { nombre: "Copa Rosario" } } }
            ]);

            await expect(
                tiposKartingService.update(1, {
                    TiposLicencias_idTipoLicenciaMinima: 2
                })
            ).rejects.toThrow("Copa Rosario");

            expect(db.tiposkarting.update).not.toHaveBeenCalled();
        });

        it("busca solo carreras de hoy en adelante, de karts de este tipo y torneos de otra licencia", async () => {
            await tiposKartingService.update(1, {
                TiposLicencias_idTipoLicenciaMinima: 2
            });

            const where = db.carreras_kartings.findMany.mock.calls[0][0].where;

            expect(where.kartings).toEqual({
                TiposKarting_idTiposKarting: 1
            });

            expect(where.Carrera_fecha.gte).toBeInstanceOf(Date);

            expect(where.carreras).toEqual({
                torneos: {
                    TiposLicencias_idTipoLicencia: { not: 2 }
                }
            });
        });

        it("cambiar solo el nombre no abre transacción", async () => {
            await tiposKartingService.update(1, { nombre: "Nuevo" });

            expect(db.$transaction).not.toHaveBeenCalled();
        });
    });

    // DELETE
    describe("delete", () => {
        it("elimina un tipo de karting por su ID", async () => {
            await tiposKartingService.delete(1);

            expect(db.tiposkarting.delete).toHaveBeenCalledWith({
                where: { idTiposKarting: 1 }
            });
        });

        it("rechaza un ID inválido", async () => {
            await expect(
                tiposKartingService.delete(0)
            ).rejects.toThrow();

            expect(db.tiposkarting.delete).not.toHaveBeenCalled();
        });
    });
});
