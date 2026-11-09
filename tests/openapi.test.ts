import { describe, expect, it } from "@jest/globals";
import spec from "../src/config/openapi";

const doc = spec as any;

describe("openapi", () => {
    it("documenta /api/kartings/disponibles", () => {
        expect(doc.paths["/api/kartings/disponibles"]?.get).toBeDefined();
    });

    it("usa un server relativo", () => {
        expect(doc.servers).toEqual([{ url: "/", description: "Mismo host que sirve la documentación" }]);
    });

    it("define respuestas 401, 403 y 409 reutilizables", () => {
        expect(Object.keys(doc.components.responses ?? {})).toEqual(
            expect.arrayContaining(["Unauthorized", "Forbidden", "Conflict"])
        );
    });

    it("las rutas CRUD documentan 401 y 403", () => {
        expect(doc.paths["/api/kartings"].get.responses["401"]).toEqual({ $ref: "#/components/responses/Unauthorized" });
        expect(doc.paths["/api/kartings/{id}"].delete.responses["403"]).toEqual({ $ref: "#/components/responses/Forbidden" });
        expect(doc.paths["/api/kartings"].post.responses["409"]).toEqual({ $ref: "#/components/responses/Conflict" });
    });
});
