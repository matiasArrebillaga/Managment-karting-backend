import { describe, expect, it } from "@jest/globals";
import { aNumeros, validarId } from "../src/utils/validar";

describe("aNumeros", () => {
    it("convierte strings numericos", () => {
        expect(aNumeros({ maximo: "3", precioHora: "12.5" }, "maximo", "precioHora"))
            .toEqual({ maximo: 3, precioHora: 12.5 });
    });

    it("deja intactos vacios, texto, numeros y ausentes", () => {
        expect(aNumeros({ a: "", b: "abc", c: 4 }, "a", "b", "c", "d"))
            .toEqual({ a: "", b: "abc", c: 4 });
    });

    it("no muta el body original", () => {
        const body = { maximo: "3" };
        aNumeros(body, "maximo");
        expect(body.maximo).toBe("3");
    });
});

describe("validarId", () => {
    it("acepta enteros y rechaza el resto", () => {
        expect(() => validarId(3)).not.toThrow();
        expect(() => validarId(NaN)).toThrow("El identificador debe ser un número entero");
        expect(() => validarId(1.5)).toThrow();
    });
});
