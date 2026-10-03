import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import inscripcionService from "../src/entities/inscripcion/inscripcion.service";

// El mock de prisma expone un objeto vacio por modelo, asi que cada test arma los
// metodos que necesita.
const db = prisma as unknown as Record<string, any>;

// Reloj fijo: la fecha y la hora de inscripcion salen del servidor, asi que los tests las
// comparan contra un valor exacto en lugar de volver a calcularlas.
const AHORA_LOCAL = new Date(2026, 5, 15, 18, 30, 45); // 15/06/2026 18:30:45 local
const HOY_UTC = new Date(Date.UTC(2026, 5, 15));

const fecha = (anio: number, mes: number, dia: number) => new Date(Date.UTC(anio, mes, dia));

const TORNEO_FUTURO = {
    idTorneos: 1,
    nombre: "Copa Julio",
    cupoMaximo: 10,
    fechaInicio: fecha(2026, 6, 1),
    fechaFin: fecha(2026, 6, 10)
};

const datosCreados = () => db.personas_torneos.create.mock.calls[0][0].data;
const filtroSolape = () => db.personas_torneos.findFirst.mock.calls[0][0].where;

beforeEach(() => {
    jest.useFakeTimers().setSystemTime(AHORA_LOCAL);
    db.torneos = { findUnique: jest.fn(async () => TORNEO_FUTURO) };
    db.personas = { findUnique: jest.fn(async () => ({ idPersona: 1 })) };
    db.personas_torneos = {
        count: jest.fn(async () => 0),
        findFirst: jest.fn(async () => null),
        findUnique: jest.fn(async () => ({ Torneos_idTorneos: 1, Personas_idPersona: 1 })),
        findMany: jest.fn(async () => []),
        create: jest.fn(async (args: any) => args.data),
        delete: jest.fn(async () => ({}))
    };
    db.$queryRaw.mockClear();
    db.$transaction.mockClear();
});

afterEach(() => {
    jest.useRealTimers();
});

describe("los timestamps los pone el servidor", () => {
    it("graba la fecha de hoy y la hora local, ignorando lo que venga en el body", async () => {
        await inscripcionService.create({
            Torneos_idTorneos: 1,
            Personas_idPersona: 1,
            // lo que el cliente intente mandar de mas no llega a la base
            fecha_inscripcion: fecha(1999, 0, 1),
            hora_inscripcion: "03:00"
        } as any);

        expect(datosCreados().fecha_inscripcion).toEqual(HOY_UTC);
        // la hora va sobre la epoch en UTC: asi la columna TIME guarda 18:30:45 y no
        // la hora corrida por la zona del servidor
        expect(datosCreados().hora_inscripcion).toEqual(new Date(Date.UTC(1970, 0, 1, 18, 30, 45)));
    });

    it("conecta el torneo y la persona por id", async () => {
        await inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 3 });

        expect(datosCreados().torneos).toEqual({ connect: { idTorneos: 1 } });
        expect(datosCreados().personas).toEqual({ connect: { idPersona: 3 } });
    });

    it("rechaza un id que no sea entero", async () => {
        await expect(inscripcionService.create({ Torneos_idTorneos: "abc", Personas_idPersona: 1 } as any))
            .rejects.toThrow("entero");
    });
});

describe("pertenencia", () => {
    it("un cliente se inscribe a su nombre aunque mande otro id", async () => {
        await inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 9 }, 4);

        expect(datosCreados().personas).toEqual({ connect: { idPersona: 4 } });
    });

    it("sin restriccion (empleado o admin) inscribe a cualquiera", async () => {
        await inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 9 });

        expect(datosCreados().personas).toEqual({ connect: { idPersona: 9 } });
    });

    it("un cliente no puede dar de baja la inscripcion de otro", async () => {
        await expect(inscripcionService.delete(1, 9, 4)).rejects.toThrow("otra persona");
        expect(db.personas_torneos.delete).not.toHaveBeenCalled();
    });

    it("getById no devuelve la inscripcion de otro cuando hay restriccion", async () => {
        expect(await inscripcionService.getById(1, 9, 4)).toBeNull();
        expect(db.personas_torneos.findUnique).not.toHaveBeenCalled();
    });

    it("getById devuelve la propia", async () => {
        expect(await inscripcionService.getById(1, 4, 4)).not.toBeNull();
    });
});

describe("estado del torneo", () => {
    it("rechaza inscribirse a un torneo que ya empezo", async () => {
        db.torneos.findUnique = jest.fn(async () => ({
            ...TORNEO_FUTURO, fechaInicio: fecha(2026, 5, 1), fechaFin: fecha(2026, 5, 20)
        }));

        await expect(inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 1 }))
            .rejects.toThrow("ya comenzó");
        expect(db.personas_torneos.create).not.toHaveBeenCalled();
    });

    it("acepta un torneo que arranca hoy", async () => {
        db.torneos.findUnique = jest.fn(async () => ({
            ...TORNEO_FUTURO, fechaInicio: HOY_UTC, fechaFin: fecha(2026, 5, 20)
        }));

        await inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 1 });

        expect(db.personas_torneos.create).toHaveBeenCalled();
    });

    it("rechaza un torneo que no existe", async () => {
        db.torneos.findUnique = jest.fn(async () => null);

        await expect(inscripcionService.create({ Torneos_idTorneos: 99, Personas_idPersona: 1 }))
            .rejects.toThrow("torneo ingresado no existe");
    });

    it("rechaza una persona que no existe", async () => {
        db.personas.findUnique = jest.fn(async () => null);

        await expect(inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 99 }))
            .rejects.toThrow("persona ingresada no existe");
    });

    it("un cliente no puede darse de baja de un torneo ya empezado", async () => {
        db.torneos.findUnique = jest.fn(async () => ({
            ...TORNEO_FUTURO, fechaInicio: fecha(2026, 5, 1)
        }));

        await expect(inscripcionService.delete(1, 4, 4)).rejects.toThrow("administrador");
        expect(db.personas_torneos.delete).not.toHaveBeenCalled();
    });

    it("un admin si puede dar de baja con el torneo empezado", async () => {
        db.torneos.findUnique = jest.fn(async () => ({
            ...TORNEO_FUTURO, fechaInicio: fecha(2026, 5, 1)
        }));

        await inscripcionService.delete(1, 4);

        expect(db.personas_torneos.delete).toHaveBeenCalled();
    });
});

describe("cupo", () => {
    it("rechaza el alta cuando el torneo llego al cupo maximo", async () => {
        db.personas_torneos.count = jest.fn(async () => 10);

        await expect(inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 1 }))
            .rejects.toThrow("cupo máximo");
        expect(db.personas_torneos.create).not.toHaveBeenCalled();
    });

    it("cuenta y graba en la misma transaccion, con la fila del torneo lockeada", async () => {
        await inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 1 });

        expect(db.$transaction).toHaveBeenCalledTimes(1);
        expect(db.$queryRaw).toHaveBeenCalledTimes(1);
        // el lock va antes de contar: si no, dos requests leen el mismo cupo libre
        expect(db.$queryRaw.mock.calls[0][0].join("?")).toContain("FOR UPDATE");
    });
});

describe("solape entre torneos", () => {
    it("compara rangos completos, no solo la fecha de inicio", async () => {
        await inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 1 });

        expect(filtroSolape()).toEqual({
            Personas_idPersona: 1,
            torneos: {
                fechaInicio: { lte: TORNEO_FUTURO.fechaFin },
                fechaFin: { gte: TORNEO_FUTURO.fechaInicio }
            }
        });
    });

    it("rechaza el alta cuando hay un torneo que se superpone", async () => {
        db.personas_torneos.findFirst = jest.fn(async () => ({
            torneos: { nombre: "Copa Junio" }
        }));

        await expect(inscripcionService.create({ Torneos_idTorneos: 1, Personas_idPersona: 1 }))
            .rejects.toThrow("Copa Junio");
        expect(db.personas_torneos.create).not.toHaveBeenCalled();
    });
});

describe("listado propio", () => {
    it("trae las inscripciones de una persona con su torneo", async () => {
        await inscripcionService.getPorPersona(4);

        expect(db.personas_torneos.findMany).toHaveBeenCalledWith({
            where: { Personas_idPersona: 4 },
            include: { torneos: true },
            orderBy: { torneos: { fechaInicio: "asc" } }
        });
    });
});
