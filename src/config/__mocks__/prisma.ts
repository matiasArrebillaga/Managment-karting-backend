import { jest } from "@jest/globals";

export const prisma = {
    $connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    circuitos: {},
    kartings: {},
    personas: {},
    roles: {},
    localidades: {},
    licencias: {},
    tiposlicencias: {},
    tiposkarting: {},
    torneos: {},
    reservas: {},
    carreras: {},
    participaciones: {},
    personas_torneos: {},
};