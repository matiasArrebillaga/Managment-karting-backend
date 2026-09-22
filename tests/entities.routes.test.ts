import request from "supertest";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../src/config/prisma");
jest.mock("../src/entities/karting/karting.service");
jest.mock("../src/entities/persona/persona.service");
jest.mock("../src/entities/localidad/localidad.service");
jest.mock("../src/entities/circuito/circuito.service");
jest.mock("../src/entities/rol/rol.service");
jest.mock("../src/entities/tipoLicencia/tiposLicencias.service");
jest.mock("../src/entities/tipoKarting/tiposKarting.service");
jest.mock("../src/entities/torneos/torneo.service");
jest.mock("../src/entities/licencia/licencia.service");
jest.mock("../src/entities/reserva/reserva.service");
jest.mock("../src/entities/carrera/carrera.service");
jest.mock("../src/entities/participacion/participacion.service");
jest.mock("../src/entities/inscripcion/inscripcion.service");
jest.mock("../src/entities/auth/auth.service");

import app from "../src/app";
import kartingService from "../src/entities/karting/karting.service";
import personaService from "../src/entities/persona/persona.service";
import localidadService from "../src/entities/localidad/localidad.service";
import circuitoService from "../src/entities/circuito/circuito.service";
import rolService from "../src/entities/rol/rol.service";
import tipoLicenciaService from "../src/entities/tipoLicencia/tiposLicencias.service";
import tipoKartingService from "../src/entities/tipoKarting/tiposKarting.service";
import torneoService from "../src/entities/torneos/torneo.service";
import licenciaService from "../src/entities/licencia/licencia.service";
import reservaService from "../src/entities/reserva/reserva.service";
import carreraService from "../src/entities/carrera/carrera.service";
import participacionService from "../src/entities/participacion/participacion.service";
import inscripcionService from "../src/entities/inscripcion/inscripcion.service";
import authService from "../src/entities/auth/auth.service";

const token = (rol: string) =>
    jwt.sign(
        { idPersona: 1, mail: "test@test.com", rol },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

type ServiceMock = Record<string, jest.Mock>;
type LooseMock = {
    mockResolvedValue(value: unknown): unknown;
};

const looseMock = (value: unknown) => value as LooseMock;
const looseService = (value: unknown) => value as ServiceMock;

const services = [
    kartingService,
    personaService,
    localidadService,
    circuitoService,
    rolService,
    tipoLicenciaService,
    tipoKartingService,
    torneoService,
    licenciaService,
    reservaService,
    carreraService,
    participacionService,
] as unknown as ServiceMock[];

beforeEach(() => {
    jest.clearAllMocks();
    for (const service of services) {
        looseMock(service.getAll).mockResolvedValue([]);
        looseMock(service.getById).mockResolvedValue({});
        looseMock(service.create).mockResolvedValue({});
        looseMock(service.update).mockResolvedValue({});
        looseMock(service.delete).mockResolvedValue({});
    }
    looseMock(reservaService.realizarReserva).mockResolvedValue({});
    looseMock(carreraService.crearCarrera).mockResolvedValue({});
    looseMock(participacionService.registrarParticipacion).mockResolvedValue({});
});

describe("rutas protegidas de todas las entidades", () => {
    const routes = [
        ["/api/kartings", "CLIENTE", kartingService],
        ["/api/personas", "ADMIN", personaService],
        ["/api/localidades", "CLIENTE", localidadService],
        ["/api/circuitos", "CLIENTE", circuitoService],
        ["/api/roles", "ADMIN", rolService],
        ["/api/tiposLicencias", "EMPLEADO", tipoLicenciaService],
        ["/api/tiposKartings", "EMPLEADO", tipoKartingService],
        ["/api/torneos", "CLIENTE", torneoService],
        ["/api/licencias", "EMPLEADO", licenciaService],
        ["/api/reservas", "EMPLEADO", reservaService],
        ["/api/carreras", "CLIENTE", carreraService],
        ["/api/participaciones", "EMPLEADO", participacionService],
        ["/api/inscripciones", "CLIENTE", inscripcionService],
    ] as const;

    it.each(routes)("rechaza sin token la ruta %s", async (path, _role, service) => {
        const response = await request(app).get(path);

        expect(response.status).toBe(401);
        expect(service.getAll).not.toHaveBeenCalled();
    });

    it.each(routes)("permite consultar %s con un rol autorizado", async (path, role, service) => {
        const response = await request(app)
            .get(path)
            .set("Authorization", `Bearer ${token(role)}`);

        expect(response.status).toBe(200);
        expect(service.getAll).toHaveBeenCalledTimes(1);
    });
});

describe("CRUD de las entidades", () => {
    const entities = [
        ["/api/kartings", "/api/kartings/1", "EMPLEADO", "EMPLEADO", "EMPLEADO", kartingService, "create"],
        ["/api/personas", "/api/personas/1", "ADMIN", "ADMIN", "ADMIN", personaService, "create"],
        ["/api/localidades", "/api/localidades/1", "EMPLEADO", "EMPLEADO", "EMPLEADO", localidadService, "create"],
        ["/api/circuitos", "/api/circuitos/1", "ADMIN", "EMPLEADO", "ADMIN", circuitoService, "create"],
        ["/api/roles", "/api/roles/1", "ADMIN", "ADMIN", "ADMIN", rolService, "create"],
        ["/api/tiposLicencias", "/api/tiposLicencias/1", "EMPLEADO", "EMPLEADO", "ADMIN", tipoLicenciaService, "create"],
        ["/api/tiposKartings", "/api/tiposKartings/1", "EMPLEADO", "EMPLEADO", "ADMIN", tipoKartingService, "create"],
        ["/api/torneos", "/api/torneos/1", "EMPLEADO", "EMPLEADO", "ADMIN", torneoService, "create"],
        ["/api/licencias", "/api/licencias/1", "EMPLEADO", "EMPLEADO", "ADMIN", licenciaService, "create"],
        ["/api/reservas", "/api/reservas/1", "CLIENTE", "CLIENTE", "EMPLEADO", reservaService, "realizarReserva"],
    ] as const;

    it.each(entities)("crea un recurso en %s", async (path, _idPath, role, _updateRole, _deleteRole, service, createMethod) => {
        const response = await request(app)
            .post(path)
            .set("Authorization", `Bearer ${token(role)}`)
            .send({});

        expect(response.status).toBe(201);
        expect((looseService(service)[createMethod] as unknown as jest.Mock)).toHaveBeenCalled();
    });

    it.each(entities)("actualiza y elimina un recurso en %s", async (_path, idPath, _role, updateRole, deleteRole, service, _createMethod) => {
        const update = await request(app)
            .patch(idPath)
            .set("Authorization", `Bearer ${token(updateRole)}`)
            .send({ actualizado: true });

        expect(update.status).toBe(200);
        expect((service.update as unknown as jest.Mock)).toHaveBeenCalledWith(1, { actualizado: true });

        const deletion = await request(app)
            .delete(idPath)
            .set("Authorization", `Bearer ${token(deleteRole)}`);

        expect(deletion.status).toBe(200);
        expect((service.delete as unknown as jest.Mock)).toHaveBeenCalledWith(1);
    });
});

describe("rutas con claves compuestas", () => {
    const compositeRoutes = [
        [
            "/api/carreras",
            "/api/carreras/2026-01-01/1/1/1",
            "EMPLEADO",
            carreraService,
            "put",
            "crearCarrera",
            "EMPLEADO",
        ],
        [
            "/api/participaciones",
            "/api/participaciones/2026-01-01/1/1/1/1",
            "CLIENTE",
            participacionService,
            "put",
            "registrarParticipacion",
            "EMPLEADO",
        ],
        [
            "/api/inscripciones",
            "/api/inscripciones/1/1",
            "EMPLEADO",
            inscripcionService,
            "put",
            "create",
            "EMPLEADO",
        ],
    ] as const;

    it.each(compositeRoutes)("crea y actualiza recursos en %s", async (path, idPath, role, service, method, createMethod, updateRole) => {
        const create = await request(app)
            .post(path)
            .set("Authorization", `Bearer ${token(role)}`)
            .send({});

        expect(create.status).toBe(201);
        expect((looseService(service)[createMethod] as unknown as jest.Mock)).toHaveBeenCalled();

        const update = await request(app)
            [method](idPath)
            .set("Authorization", `Bearer ${token(updateRole)}`)
            .send({ actualizado: true });

        expect(update.status).toBe(200);
        expect((service.update as unknown as jest.Mock)).toHaveBeenCalled();
    });
});

describe("autenticación", () => {
    it("registra una persona", async () => {
        looseMock(authService.register).mockResolvedValue({ idPersona: 1 });

        const response = await request(app)
            .post("/api/auth/register")
            .send({ mail: "test@test.com" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ idPersona: 1 });
        expect((authService.register as unknown as jest.Mock)).toHaveBeenCalledWith({ mail: "test@test.com" });
    });

    it("inicia sesión y devuelve el token", async () => {
        looseMock(authService.login).mockResolvedValue({
            token: "token-de-prueba",
            persona: { idPersona: 1 },
        });

        const response = await request(app)
            .post("/api/auth/login")
            .send({ mail: "test@test.com", contraseña: "secret" });

        expect(response.status).toBe(200);
        expect(response.body.token).toBe("token-de-prueba");
    });
});
