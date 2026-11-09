import "dotenv/config"; // primero, los modulos de abajo leen process.env
import app from "./app";
import { prisma } from "./config/prisma";

// sin estas variables no arranca
for (const variable of ["JWT_SECRET", "FRONTEND_URL", "DATABASE_URL"]) {
    if (!process.env[variable]) {
        console.error(`Falta la variable de entorno ${variable}`);
        process.exit(1);
    }
}

const PORT = Number(process.env.PORT) || 3000; // railway pone el PORT, en local 3000

async function startServer() {
    try {
        await prisma.$connect(); // conexion a prisma que conecta a la base de datos

        console.log("Conectado a MySQL mediante Prisma");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        }); // aca es donde el server empieza a funcionar si no encuentra algun error
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error); 
        process.exit(1); // si existe algun error en el try se cancela el inicio del server y el catch indica el error
    }
}

startServer();

// railway manda SIGTERM al redeployar, se cierra el pool antes de salir
async function apagar(senal: string) {
    console.log(`${senal} recibido, cerrando conexión a la base`);
    await prisma.$disconnect();
    process.exit(0);
}
process.on("SIGTERM", () => void apagar("SIGTERM"));
process.on("SIGINT", () => void apagar("SIGINT"));
process.on("unhandledRejection", (error) => {
    console.error("Promesa rechazada sin manejar:", error);
});