
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma } from "../../src/generated/prisma/client";

import {
    opcionesTxBloqueo,
    bloquearFranja,
    franjaOcupada,
    validarLicenciaEnCarrerasFuturas
} from "../../src/utils/ocupacion";

describe("opcionesTxBloqueo", () => {
    it("utiliza el nivel de aislamiento ReadCommitted", () => {
        expect(opcionesTxBloqueo.isolationLevel)
            .toBe(Prisma.TransactionIsolationLevel.ReadCommitted);
    });
});

describe("bloquearFranja", () => {
    let db: any;

    beforeEach(() => {
        db = {
            $queryRaw: jest.fn(async () => []),
            $executeRaw: jest.fn(async () => 1)
        };
    });

    it("bloquea los kartings, consulta el circuito y crea la franja", async () => {
        let llamadas = 0;

        db.$queryRaw.mockImplementation(async () => {
            llamadas++;
            return llamadas === 2 ? [{ idCircuitos: 1 }] : [];
        });

        const fecha = new Date("2026-11-20T00:00:00.000Z");

        await bloquearFranja(db, [1, 2], 1, fecha);

        expect(db.$queryRaw).toHaveBeenCalledTimes(2);
        expect(db.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it("no consulta los kartings si la lista está vacía", async () => {
        db.$queryRaw.mockResolvedValue([{ idCircuitos: 1 }]);

        await bloquearFranja(
            db,
            [],
            1,
            new Date("2026-11-20T00:00:00.000Z")
        );

        expect(db.$queryRaw).toHaveBeenCalledTimes(1);
        expect(db.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it("rechaza la operación si el circuito no existe", async () => {
        db.$queryRaw.mockResolvedValue([]);

        await expect(
            bloquearFranja(
                db,
                [],
                999,
                new Date("2026-11-20T00:00:00.000Z")
            )
        ).rejects.toThrow("El circuito no existe");

        expect(db.$executeRaw).not.toHaveBeenCalled();
    });
});

describe("franjaOcupada", () => {
    let db: any;

    beforeEach(() => {
        db = {
            reservas: {
                findMany: jest.fn(async () => [])
            },
            carreras_kartings: {
                findMany: jest.fn(async () => [])
            }
        };
    });

    it("combina las reservas y las carreras encontradas", async () => {
        db.reservas.findMany.mockResolvedValue([
            {
                Kartings_idKartings: 1,
                Circuitos_idCircuitos: 10
            }
        ]);

        db.carreras_kartings.findMany.mockResolvedValue([
            {
                Kartings_idKartings: 2,
                Carrera_Circuitos_idCircuitos: 20
            }
        ]);

        const resultado = await franjaOcupada(
            db,
            new Date("2026-11-20T00:00:00.000Z"),
            new Date("1970-01-01T14:00:00.000Z"),
            new Date("1970-01-01T15:00:00.000Z")
        );

        expect(resultado).toEqual([
            {
                Kartings_idKartings: 1,
                Circuitos_idCircuitos: 10
            },
            {
                Kartings_idKartings: 2,
                Circuitos_idCircuitos: 20
            }
        ]);
    });

    it("devuelve una lista vacía si no hay reservas ni carreras", async () => {
        const resultado = await franjaOcupada(
            db,
            new Date("2026-11-20T00:00:00.000Z"),
            new Date("1970-01-01T14:00:00.000Z"),
            new Date("1970-01-01T15:00:00.000Z")
        );

        expect(resultado).toEqual([]);
    });

    it("busca horarios que se superponen", async () => {
        const fecha = new Date("2026-11-20T00:00:00.000Z");
        const horaInicio = new Date("1970-01-01T14:00:00.000Z");
        const horaFin = new Date("1970-01-01T15:00:00.000Z");

        await franjaOcupada(db, fecha, horaInicio, horaFin);

        expect(db.reservas.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    fechaReserva: fecha,
                    horaInicio: { lt: horaFin },
                    horaFin: { gt: horaInicio }
                })
            })
        );
    });

    it("excluye la reserva que se está editando", async () => {
        await franjaOcupada(
            db,
            new Date("2026-11-20T00:00:00.000Z"),
            new Date("1970-01-01T14:00:00.000Z"),
            new Date("1970-01-01T15:00:00.000Z"),
            { idReserva: 5 }
        );

        expect(db.reservas.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    NOT: { idReservas: 5 }
                })
            })
        );
    });

    it("excluye la carrera que se está editando", async () => {
        const carrera = {
            Torneos_idTorneos: 3,
            Circuitos_idCircuitos: 10
        };

        await franjaOcupada(
            db,
            new Date("2026-11-20T00:00:00.000Z"),
            new Date("1970-01-01T14:00:00.000Z"),
            new Date("1970-01-01T15:00:00.000Z"),
            { carrera }
        );

        expect(db.carreras_kartings.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    carreras: expect.objectContaining({
                        NOT: carrera
                    })
                })
            })
        );
    });
});

describe("validarLicenciaEnCarrerasFuturas", () => {
    let db: any;

    beforeEach(() => {
        db = {
            carreras_kartings: {
                findMany: jest.fn(async () => [])
            }
        };
    });

    it("no lanza error si no existen carreras con licencias incompatibles", async () => {
        await expect(
            validarLicenciaEnCarrerasFuturas(
                db,
                { idKartings: 1 },
                2
            )
        ).resolves.toBeUndefined();
    });

    it("rechaza el cambio de licencia si existen carreras incompatibles", async () => {
        db.carreras_kartings.findMany.mockResolvedValue([
            {
                carreras: {
                    torneos: { nombre: "Torneo Primavera" }
                }
            }
        ]);

        await expect(
            validarLicenciaEnCarrerasFuturas(
                db,
                { idKartings: 1 },
                2
            )
        ).rejects.toThrow(
            "No se puede cambiar: hay kartings asignados a carreras de Torneo Primavera, que exigen otra licencia"
        );
    });

    it("no repite nombres de torneos en el mensaje de error", async () => {
        db.carreras_kartings.findMany.mockResolvedValue([
            {
                carreras: {
                    torneos: { nombre: "Torneo Primavera" }
                }
            },
            {
                carreras: {
                    torneos: { nombre: "Torneo Primavera" }
                }
            }
        ]);

        await expect(
            validarLicenciaEnCarrerasFuturas(
                db,
                { idKartings: 1 },
                2
            )
        ).rejects.toThrow(
            "No se puede cambiar: hay kartings asignados a carreras de Torneo Primavera, que exigen otra licencia"
        );
    });
});
