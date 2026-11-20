
import { afterEach, describe, expect, it, jest } from "@jest/globals";

import {
    ahoraArgentina,
    hoyUTC,
    horaActualUTC,
    normalizarHora,
    normalizarFecha
} from "../../src/utils/fecha";

//Estamos testeando que la horas ingresadas se guarden en el formato correcto y que respete la hora de Argentina.
afterEach(() => {
    jest.useRealTimers();
});

describe("ahoraArgentina", () => {
    it("convierte una fecha UTC a la hora de Argentina", () => {
        const fecha = new Date("2026-01-15T02:30:00.000Z");

        const resultado = ahoraArgentina(fecha);

        expect(resultado.toISOString()).toBe("2026-01-14T23:30:00.000Z");
    });
});

describe("hoyUTC", () => {
    it("devuelve el día actual de Argentina a medianoche UTC", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-01-15T02:30:00.000Z"));

        const resultado = hoyUTC();

        expect(resultado.toISOString()).toBe("2026-01-14T00:00:00.000Z");
    });
});

describe("horaActualUTC", () => {
    it("devuelve la hora actual de Argentina con fecha 1970-01-01", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-01-15T02:30:00.000Z"));

        const resultado = horaActualUTC();

        expect(resultado.toISOString()).toBe("1970-01-01T23:30:00.000Z");
    });
});

describe("normalizarHora", () => {
    it("convierte HH:MM a un objeto Date", () => {
        const resultado = normalizarHora("14:30", "hora");

        expect(resultado.toISOString()).toBe("1970-01-01T14:30:00.000Z");
    });

    it("acepta horas con segundos", () => {
        const resultado = normalizarHora("14:30:45", "hora");

        expect(resultado.toISOString()).toBe("1970-01-01T14:30:45.000Z");
    });

    it("elimina espacios antes de convertir la hora", () => {
        const resultado = normalizarHora(" 08:45 ", "hora");

        expect(resultado.toISOString()).toBe("1970-01-01T08:45:00.000Z");
    });

    it("rechaza horas fuera de rango", () => {
        expect(() => normalizarHora("25:30", "hora"))
            .toThrow("El campo hora debe tener formato HH:MM");

        expect(() => normalizarHora("14:75", "hora"))
            .toThrow("El campo hora debe tener formato HH:MM");
    });

    it("devuelve el mismo objeto si recibe una fecha", () => {
        const fecha = new Date("1970-01-01T14:30:00.000Z");

        const resultado = normalizarHora(fecha, "hora");

        expect(resultado).toBe(fecha);
    });
});

describe("normalizarFecha", () => {
    it("convierte una fecha YYYY-MM-DD a medianoche UTC", () => {
        const resultado = normalizarFecha("2026-11-20");

        expect(resultado.toISOString()).toBe("2026-11-20T00:00:00.000Z");
    });

    it("rechaza un formato de fecha incorrecto", () => {
        expect(() => normalizarFecha("20/11/2026"))
            .toThrow("La fecha debe tener formato YYYY-MM-DD");
    });

    it("rechaza una fecha inválida", () => {
        expect(() => normalizarFecha("2026-13-01"))
            .toThrow("La fecha no es válida");
    });

    it("acepta un objeto Date y normaliza su hora a medianoche UTC", () => {
        const fecha = new Date("2026-11-20T18:45:30.000Z");

        const resultado = normalizarFecha(fecha);

        expect(resultado.toISOString()).toBe("2026-11-20T00:00:00.000Z");
    });
});
