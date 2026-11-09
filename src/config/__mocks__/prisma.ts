import { jest } from "@jest/globals";

export const prisma = {
    $connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    // El callback recibe el mismo objeto, asi que los tests mockean los modelos una sola vez
    // y da igual si el service corre adentro o afuera de la transaccion.
    $transaction: jest.fn(async (cb: any) => cb(prisma)),
    $queryRaw: jest.fn(async () => []),
    $executeRaw: jest.fn(async () => 1),
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
    carreras_kartings: {},
    participaciones: {},
    personas_torneos: {},
};