import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

// la misma url que usan las migraciones
const url = new URL(process.env.DATABASE_URL ?? "mysql://localhost:3306/karting");

const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true
});

// la conexion la abre server.ts asi jest no queda colgado
export const prisma = new PrismaClient({
    adapter,
});
