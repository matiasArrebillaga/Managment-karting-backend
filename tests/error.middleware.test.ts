import { describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from "express";
import { AppError, errorHandler } from "../src/middleware/error.middleware";

// arma un res falso que guarda el status y el json que se mandan
const responder = (err: unknown) => {
    const res = { statusCode: 0, body: undefined as unknown } as any;
    res.status = (code: number) => { res.statusCode = code; return res; };
    res.json = (body: unknown) => { res.body = body; return res; };
    jest.spyOn(console, "error").mockImplementation(() => {});
    errorHandler(err, {} as Request, res as Response, () => {});
    return res as { statusCode: number; body: unknown };
};

describe("errorHandler", () => {
    it("AppError usa su status y su mensaje", () => {
        expect(responder(new AppError("dato invalido"))).toMatchObject({ statusCode: 400, body: { message: "dato invalido" } });
        expect(responder(new AppError("prohibido", 403))).toMatchObject({ statusCode: 403, body: { message: "prohibido" } });
    });

    it("P2025 de Prisma es 404", () => {
        expect(responder({ code: "P2025" })).toMatchObject({ statusCode: 404, body: { message: "Recurso no encontrado" } });
    });

    it("P2002 de Prisma es 409", () => {
        expect(responder({ code: "P2002" })).toMatchObject({ statusCode: 409, body: { message: "El recurso ya existe" } });
    });

    it("P2003 de Prisma es 409", () => {
        expect(responder({ code: "P2003" })).toMatchObject({ statusCode: 409, body: { message: "El recurso referenciado no existe o está en uso" } });
    });

    it("un Error de JavaScript es 500 y no expone el mensaje interno", () => {
        const res = responder(new TypeError("Cannot read properties of undefined (reading 'trim')"));
        expect(res).toMatchObject({ statusCode: 500, body: { message: "Error interno del servidor" } });
    });

    it("cualquier otra cosa es 500", () => {
        expect(responder("texto")).toMatchObject({ statusCode: 500, body: { message: "Error interno del servidor" } });
    });
});
