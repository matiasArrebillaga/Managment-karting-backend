import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { ahoraArgentina, horaActualUTC, hoyUTC, normalizarHora } from "../src/utils/fecha";

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
