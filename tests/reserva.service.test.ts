import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");

import { prisma } from "../src/config/prisma";
import reservaService from "../src/entities/reserva/reserva.service";

// El mock de prisma expone un objeto vacio por modelo, asi que cada test arma los
// metodos que necesita.
const db = prisma as unknown as Record<string, any>;

const hora = (texto: string) => {
    const [h, m] = texto.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, h, m));
};

// Senior: 20000 por hora, exige licencia de nivel 2
const KARTING_SENIOR = {
    idKartings: 4,
    estado: "Disponible",
    tiposkarting: { precioHora: 20000, tiposlicencias: { nivel: 2 } }
};

// Fecha siempre futura, para no depender de cuando se corran los tests
const EN_UN_ANIO = new Date(Date.UTC(new Date().getFullYear() + 1, 5, 1));

const reservaValida = () => ({
    fechaReserva: EN_UN_ANIO,
    horaInicio: hora("10:00"),
    horaFin: hora("12:00"),
    Personas_idPersona: 1,
    Circuitos_idCircuitos: 1,
    Kartings_idKartings: 4
});

const datosCreados = () => db.reservas.create.mock.calls[0][0].data;
const filtroSolapes = () => db.reservas.findMany.mock.calls[0][0].where;

beforeEach(() => {
    db.$transaction.mockClear();
    db.$queryRaw.mockClear();
    db.personas = { findUnique: jest.fn(async () => ({ idPersona: 1 })) };
    db.kartings = { findUnique: jest.fn(async () => KARTING_SENIOR) };
    db.circuitos = { findUnique: jest.fn(async () => ({ idCircuitos: 1, maximo: 8 })) };
    db.licencias = { findFirst: jest.fn(async () => ({ idLicencias: 1, nivel: 2 })) };
    db.reservas = {
        findMany: jest.fn(async () => [] as unknown[]),
        findUnique: jest.fn(async () => null as unknown),
        create: jest.fn(async ({ data }: any) => ({ idReservas: 99, ...data })),
        update: jest.fn(async ({ data }: any) => ({ idReservas: 99, ...data }))
    };
    db.carreras = { findMany: jest.fn(async () => [] as unknown[]) };
});

describe("calculo del monto", () => {
    it("cobra precioHora por la cantidad de horas reservadas", async () => {
        await reservaService.realizarReserva(reservaValida());

        // 2 horas x 20000
        expect(String(datosCreados().monto)).toBe("40000");
    });

    it("el monto nunca sale de la request", async () => {
        const conMonto = { ...reservaValida(), monto: 1 } as never;
        await reservaService.realizarReserva(conMonto);

        expect(String(datosCreados().monto)).toBe("40000");
    });

    it("rechaza una franja que no sea de horas enteras", async () => {
        await expect(reservaService.realizarReserva({
            ...reservaValida(),
            horaFin: hora("11:30")
        })).rejects.toThrow(/horas enteras/);

        expect(db.reservas.create).not.toHaveBeenCalled();
    });

    it("rechaza una franja invertida o vacia", async () => {
        await expect(reservaService.realizarReserva({
            ...reservaValida(),
            horaInicio: hora("12:00"),
            horaFin: hora("10:00")
        })).rejects.toThrow(/anterior a la hora de fin/);
    });
});

describe("controles de disponibilidad", () => {
    it("normaliza la fecha a medianoche UTC antes de buscar solapamientos", async () => {
        // Si la fecha se usara tal cual viene, el filtro no encontraria ninguna fila y
        // el control de doble reserva pasaria de largo.
        const conHora = new Date(EN_UN_ANIO);
        conHora.setUTCHours(14, 30);

        await reservaService.realizarReserva({ ...reservaValida(), fechaReserva: conHora });

        expect(filtroSolapes().fechaReserva.toISOString()).toBe(EN_UN_ANIO.toISOString());
    });

    it("rechaza una fecha pasada en el alta", async () => {
        await expect(reservaService.realizarReserva({
            ...reservaValida(),
            fechaReserva: new Date("2020-01-01T00:00:00.000Z")
        })).rejects.toThrow(/fecha pasada/);

        expect(db.reservas.create).not.toHaveBeenCalled();
    });

    it("rechaza asignar un karting que no esta disponible", async () => {
        db.kartings = { findUnique: jest.fn(async () => ({ ...KARTING_SENIOR, estado: "Mantenimiento" })) };

        await expect(reservaService.realizarReserva(reservaValida()))
            .rejects.toThrow(/no está disponible \(estado: Mantenimiento\)/);
    });

    it("rechaza si el karting ya esta reservado en esa franja", async () => {
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 4, Circuitos_idCircuitos: 2 }
        ]);

        await expect(reservaService.realizarReserva(reservaValida()))
            .rejects.toThrow(/ya está reservado en ese horario/);
    });

    it("rechaza si el circuito llego a su maximo en esa franja", async () => {
        db.circuitos = { findUnique: jest.fn(async () => ({ idCircuitos: 1, maximo: 1 })) };
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 7, Circuitos_idCircuitos: 1 }
        ]);

        await expect(reservaService.realizarReserva(reservaValida()))
            .rejects.toThrow(/cupo maximo/);
    });

    it("rechaza si el karting corre una carrera en esa franja", async () => {
        db.carreras.findMany = jest.fn(async () => [
            { Kartings_idKartings: 4, Circuitos_idCircuitos: 2 }
        ]);

        await expect(reservaService.realizarReserva(reservaValida()))
            .rejects.toThrow(/ya está reservado en ese horario/);
    });

    it("cuenta las carreras en el cupo del circuito", async () => {
        db.circuitos = { findUnique: jest.fn(async () => ({ idCircuitos: 1, maximo: 2 })) };
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 7, Circuitos_idCircuitos: 1 }
        ]);
        db.carreras.findMany = jest.fn(async () => [
            { Kartings_idKartings: 8, Circuitos_idCircuitos: 1 }
        ]);

        await expect(reservaService.realizarReserva(reservaValida()))
            .rejects.toThrow(/cupo maximo/);
    });

    it("rechaza si la licencia no alcanza el nivel del karting", async () => {
        db.licencias = { findFirst: jest.fn(async () => null) };

        await expect(reservaService.realizarReserva(reservaValida()))
            .rejects.toThrow(/licencia de nivel suficiente/);

        expect(db.reservas.create).not.toHaveBeenCalled();
    });
});

describe("update revalida igual que el alta", () => {
    const guardada = () => ({
        idReservas: 99,
        ...reservaValida(),
        monto: 40000
    });

    it("rechaza un patch que deje la reserva sin licencia valida", async () => {
        db.reservas.findUnique = jest.fn(async () => guardada());
        db.licencias = { findFirst: jest.fn(async () => null) };

        await expect(reservaService.update(99, { Kartings_idKartings: 7 }))
            .rejects.toThrow(/licencia de nivel suficiente/);

        expect(db.reservas.update).not.toHaveBeenCalled();
    });

    it("rechaza un patch que pise la franja de otra reserva", async () => {
        db.reservas.findUnique = jest.fn(async () => guardada());
        db.reservas.findMany = jest.fn(async () => [
            { Kartings_idKartings: 4, Circuitos_idCircuitos: 1 }
        ]);

        await expect(reservaService.update(99, { horaFin: hora("13:00") }))
            .rejects.toThrow(/ya está reservado en ese horario/);
    });

    it("excluye la propia reserva del control de solapamiento", async () => {
        db.reservas.findUnique = jest.fn(async () => guardada());

        await reservaService.update(99, { horaFin: hora("13:00") });

        expect(filtroSolapes().NOT).toEqual({ idReservas: 99 });
    });

    it("recalcula el monto con la franja nueva", async () => {
        db.reservas.findUnique = jest.fn(async () => guardada());

        await reservaService.update(99, { horaFin: hora("13:00") });

        // 3 horas x 20000
        expect(String(db.reservas.update.mock.calls[0][0].data.monto)).toBe("60000");
    });

    it("falla si la reserva no existe", async () => {
        db.reservas.findUnique = jest.fn(async () => null);

        await expect(reservaService.update(99, { horaFin: hora("13:00") }))
            .rejects.toThrow(/no existe/);
    });
});

describe("reglas que solo aplican al campo que se asigna", () => {
    // Reserva vieja, con fecha pasada y kart en mantenimiento: editarla no deberia
    // fallar por esas dos cosas mientras el patch no las toque.
    const reservaVieja = () => ({
        idReservas: 8,
        fechaReserva: new Date("2020-01-01T00:00:00.000Z"),
        horaInicio: hora("10:00"),
        horaFin: hora("11:00"),
        Personas_idPersona: 1,
        Circuitos_idCircuitos: 1,
        Kartings_idKartings: 3,
        monto: 15000
    });

    beforeEach(() => {
        db.reservas.findUnique = jest.fn(async () => reservaVieja());
        db.kartings = { findUnique: jest.fn(async () => ({ ...KARTING_SENIOR, estado: "Mantenimiento" })) };
    });

    it("no revalida la fecha vieja si el patch no manda fecha", async () => {
        await reservaService.update(8, { horaFin: hora("12:00") });

        expect(db.reservas.update).toHaveBeenCalled();
        expect(String(db.reservas.update.mock.calls[0][0].data.monto)).toBe("40000");
    });

    it("rechaza el patch cuando si manda una fecha pasada", async () => {
        await expect(reservaService.update(8, { fechaReserva: new Date("2019-05-05T00:00:00.000Z") }))
            .rejects.toThrow(/fecha pasada/);
    });

    it("rechaza el patch cuando asigna un kart en mantenimiento", async () => {
        await expect(reservaService.update(8, { Kartings_idKartings: 3 }))
            .rejects.toThrow(/no está disponible/);
    });
});

describe("pertenencia", () => {
    it("el alta de un cliente se graba a su nombre, ignorando el body", async () => {
        await reservaService.realizarReserva(
            { ...reservaValida(), Personas_idPersona: 2 },
            7
        );

        expect(datosCreados().Personas_idPersona).toBe(7);
    });

    it("un cliente no puede modificar la reserva de otro", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ ...reservaValida(), idReservas: 50, Personas_idPersona: 2 }));

        await expect(reservaService.update(50, { horaFin: hora("13:00") }, 7))
            .rejects.toMatchObject({ statusCode: 403 });

        expect(db.reservas.update).not.toHaveBeenCalled();
    });

    it("un cliente no puede pasarle su reserva a otra persona", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ ...reservaValida(), idReservas: 50, Personas_idPersona: 7 }));

        await reservaService.update(50, { Personas_idPersona: 2 }, 7);

        expect(db.reservas.update.mock.calls[0][0].data.Personas_idPersona).toBe(7);
    });

    it("un cliente no puede borrar la reserva de otro", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ ...reservaValida(), idReservas: 50, Personas_idPersona: 2 }));
        db.reservas.delete = jest.fn(async () => ({}));

        await expect(reservaService.delete(50, 7))
            .rejects.toMatchObject({ statusCode: 403 });

        expect(db.reservas.delete).not.toHaveBeenCalled();
    });

    it("un cliente si puede borrar la propia", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ ...reservaValida(), idReservas: 50, Personas_idPersona: 7 }));
        db.reservas.delete = jest.fn(async () => ({ idReservas: 50 }));

        await reservaService.delete(50, 7);

        expect(db.reservas.delete).toHaveBeenCalledWith({ where: { idReservas: 50 } });
    });

    it("sin restriccion (empleado o admin) opera sobre cualquiera", async () => {
        await reservaService.realizarReserva({ ...reservaValida(), Personas_idPersona: 2 });

        expect(datosCreados().Personas_idPersona).toBe(2);
    });

    // 404 y no 403: el 403 le confirmaria al cliente que la reserva existe
    it("getById no devuelve la reserva de otro cuando hay restriccion", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ idReservas: 50, Personas_idPersona: 2 }));

        expect(await reservaService.getById(50, 7)).toBeNull();
    });

    it("getById devuelve la propia", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ idReservas: 50, Personas_idPersona: 7 }));

        expect(await reservaService.getById(50, 7)).not.toBeNull();
    });
});

describe("solapamiento y escritura en la misma transaccion", () => {
    it("el alta valida y graba dentro de $transaction, con los recursos lockeados", async () => {
        await reservaService.realizarReserva(reservaValida());

        expect(db.$transaction).toHaveBeenCalledTimes(1);
        // kart y circuito, en ese orden, para no cruzar locks entre requests
        expect(db.$queryRaw).toHaveBeenCalledTimes(2);
        expect(db.$queryRaw.mock.calls[0][0].join("?")).toContain("kartings");
        expect(db.$queryRaw.mock.calls[1][0].join("?")).toContain("circuitos");
    });

    it("el patch tambien revalida y graba dentro de $transaction", async () => {
        db.reservas.findUnique = jest.fn(async () => ({ ...reservaValida(), idReservas: 50, Personas_idPersona: 7 }));

        await reservaService.update(50, { horaFin: hora("13:00") });

        expect(db.$transaction).toHaveBeenCalledTimes(1);
    });
});

// Lo que antes convertia el controller: ahora la entrada cruda llega hasta aca.
describe("normalizacion de la entrada", () => {
    it("acepta las horas como texto HH:MM", async () => {
        await reservaService.realizarReserva({
            ...reservaValida(), horaInicio: "10:00", horaFin: "12:00"
        });

        expect(datosCreados().horaInicio).toEqual(hora("10:00"));
        expect(datosCreados().horaFin).toEqual(hora("12:00"));
        expect(String(datosCreados().monto)).toBe("40000");
    });

    it("acepta la fecha como texto", async () => {
        await reservaService.realizarReserva({
            ...reservaValida(), fechaReserva: `${new Date().getFullYear() + 1}-06-01`
        });

        expect(datosCreados().fechaReserva).toEqual(EN_UN_ANIO);
    });

    it("rechaza una hora con formato invalido", async () => {
        await expect(reservaService.realizarReserva({ ...reservaValida(), horaInicio: "25:00" }))
            .rejects.toThrow("El campo horaInicio debe tener formato HH:MM");
    });

    it("rechaza una reserva sin horario", async () => {
        await expect(reservaService.realizarReserva(
            { ...reservaValida(), horaInicio: undefined } as any
        )).rejects.toThrow("El campo horaInicio debe tener formato HH:MM");
    });

    it("descarta del patch los campos que no son de la reserva", async () => {
        db.reservas.findUnique = jest.fn(async () => ({
            idReservas: 8,
            fechaReserva: EN_UN_ANIO,
            horaInicio: hora("10:00"),
            horaFin: hora("12:00"),
            Personas_idPersona: 1,
            Circuitos_idCircuitos: 1,
            Kartings_idKartings: 4,
            monto: 1000
        }));

        await reservaService.update(8, { monto: 1, actualizado: true } as any);

        const data = db.reservas.update.mock.calls[0][0].data;
        expect(data).not.toHaveProperty("actualizado");
        // el monto es el recalculado, no el que vino en el body
        expect(String(data.monto)).toBe("40000");
    });
});
