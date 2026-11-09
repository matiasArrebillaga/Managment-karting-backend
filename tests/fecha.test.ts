import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { ahoraArgentina, horaActualUTC, hoyUTC, normalizarFecha, normalizarHora } from "../src/utils/fecha";

afterEach(() => {
    jest.useRealTimers();
});

describe("hora de Argentina sin depender del TZ del proceso", () => {
    it("a las 22:00 de Argentina en UTC ya es el dia siguiente, pero hoy sigue siendo hoy", () => {
        jest.useFakeTimers().setSystemTime(new Date("2026-06-15T22:00:00-03:00"));

        expect(hoyUTC()).toEqual(new Date(Date.UTC(2026, 5, 15)));
        expect(horaActualUTC()).toEqual(new Date(Date.UTC(1970, 0, 1, 22, 0, 0)));
    });

    it("ahoraArgentina devuelve la hora de pared como si fuera UTC", () => {
        expect(ahoraArgentina(new Date("2026-01-01T02:15:30Z")))
            .toEqual(new Date(Date.UTC(2025, 11, 31, 23, 15, 30)));
    });
});

describe("normalizarHora", () => {
    it("convierte HH:MM y HH:MM:SS a TIME sobre la epoch UTC", () => {
        expect(normalizarHora("09:05", "horaInicio")).toEqual(new Date(Date.UTC(1970, 0, 1, 9, 5)));
        expect(normalizarHora(" 23:59:58 ", "horaFin")).toEqual(new Date(Date.UTC(1970, 0, 1, 23, 59, 58)));
    });

    it("rechaza formatos invalidos", () => {
        expect(() => normalizarHora("24:00", "horaInicio")).toThrow("El campo horaInicio debe tener formato HH:MM");
        expect(() => normalizarHora("9:5", "horaInicio")).toThrow("HH:MM");
        expect(() => normalizarHora(undefined, "horaFin")).toThrow("El campo horaFin");
    });
});

describe("normalizarFecha estricta", () => {
    it("acepta YYYY-MM-DD y devuelve medianoche UTC", () => {
        expect(normalizarFecha("2026-11-09").toISOString()).toBe("2026-11-09T00:00:00.000Z");
    });

    it("acepta un Date", () => {
        expect(normalizarFecha(new Date("2026-11-09T15:00:00Z")).toISOString()).toBe("2026-11-09T00:00:00.000Z");
    });

    it.each(["2026-11-09T03:00:00-03:00", "2026-11-09T00:00:00Z", "09/11/2026", "", "2026-13-40"])(
        "rechaza %p", valor => {
            expect(() => normalizarFecha(valor)).toThrow();
        }
    );
});
