
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

    // sin carreras futuras que choquen con la licencia nueva
    db.carreras_kartings = {
        findMany: jest.fn(async () => [])
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
            precioHora: 50000,
            TiposLicencias_idTipoLicenciaMinima: 1
        });
        expect(datosEnviados).not.toHaveProperty("idTiposKarting");
        expect(datosEnviados).not.toHaveProperty("kartings");
    });
});

describe("licencia mínima de un tipo con karts en carreras futuras", () => {
    it("rechaza el cambio si algún kart corre en un torneo de otra licencia", async () => {
        db.carreras_kartings.findMany = jest.fn(async () => [{ carreras: { torneos: { nombre: "Copa Rosario" } } }]);

        await expect(tiposKartingService.update(1, { TiposLicencias_idTipoLicenciaMinima: 2 }))
            .rejects.toThrow("Copa Rosario");
        expect(db.tiposkarting.update).not.toHaveBeenCalled();
    });

    it("busca solo carreras de hoy en adelante, de karts de este tipo y torneos de otra licencia", async () => {
        await tiposKartingService.update(1, { TiposLicencias_idTipoLicenciaMinima: 2 });

        const where = db.carreras_kartings.findMany.mock.calls[0][0].where;
        expect(where.kartings).toEqual({ TiposKarting_idTiposKarting: 1 });
        expect(where.Carrera_fecha.gte).toBeInstanceOf(Date);
        expect(where.carreras).toEqual({ torneos: { TiposLicencias_idTipoLicencia: { not: 2 } } });
    });

    it("cambiar solo el nombre no abre transacción", async () => {
        await tiposKartingService.update(1, { nombre: "Nuevo" });
        expect(db.$transaction).not.toHaveBeenCalled();
    });
});
