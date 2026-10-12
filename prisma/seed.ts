/// <reference types="node" />
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

// Datos base que el codigo asume que existen:
// verifyRoles() compara contra estos tres nombres de rol, y personaService.create
// exige que el rol y la localidad existan antes de poder registrar a nadie.

const LOCALIDAD_INICIAL = "Rosario";

// Se busca por el nombre y recien se crea si falta: el schema no tiene @unique en
// ningun campo, asi que un upsert solo podria buscar por el id y sobreescribiria las
// filas que ya existan en la base. Asi el seed se puede correr muchas veces sin
// duplicar ni pisar nada.
async function asegurarRol(nombre: string) {
    const existente = await prisma.roles.findFirst({ where: { nombre } });
    return existente ?? await prisma.roles.create({ data: { nombre } });
}

async function asegurarLocalidad(nombre: string) {
    const existente = await prisma.localidades.findFirst({ where: { nombre } });
    return existente ?? await prisma.localidades.create({ data: { nombre } });
}

async function asegurarAdmin(idRol: number, idLocalidad: number) {
    // Alcanza con que exista algun ADMIN: si ya hay uno no se crea otro, sin importar
    // con que mail lo hayan dado de alta.
    const existente = await prisma.personas.findFirst({ where: { idRol } });
    if (existente) {
        return existente;
    }

    const mail = process.env.SEED_ADMIN_MAIL ?? "admin@karting.com";

    // Solo se pide la contraseña cuando hay que crear el ADMIN, para que el seed se
    // pueda volver a correr sin tener que tener el secreto a mano.
    const contraseña = process.env.SEED_ADMIN_PASSWORD;
    if (!contraseña) {
        throw new Error(
            "Falta SEED_ADMIN_PASSWORD en .env para crear el ADMIN inicial"
        );
    }

    return await prisma.personas.create({
        data: {
            nombre: "Admin",
            apellido: "Inicial",
            dni: "00000000",
            fechaNacimiento: new Date("1990-01-01"),
            mail,
            telefono: "0000000000",
            contraseña: await bcrypt.hash(contraseña, 10), // mismo costo que personaService
            Localidades_idLocalidades: idLocalidad,
            idRol
        }
    });
}

async function main() {
    const rolAdmin = await asegurarRol("ADMIN");
    await asegurarRol("EMPLEADO");
    const rolCliente = await asegurarRol("CLIENTE");

    const localidad = await asegurarLocalidad(LOCALIDAD_INICIAL);
    const admin = await asegurarAdmin(rolAdmin.idRol, localidad.idLocalidades);

    console.log("Seed listo:");
    console.log(`  rol CLIENTE    -> idRol ${rolCliente.idRol} (el que usa register)`);
    console.log(`  localidad      -> idLocalidades ${localidad.idLocalidades}`);
    console.log(`  ADMIN inicial  -> ${admin.mail} (idPersona ${admin.idPersona})`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    // src/config/prisma.ts abre el pool al importarse y nunca lo cierra, asi que sin
    // esto el proceso del seed no termina.
    .finally(() => prisma.$disconnect());
