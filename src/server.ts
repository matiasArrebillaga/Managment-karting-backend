import app from "./app";
import { prisma } from "./config/prisma";

const PORT = 3000;

async function startServer() {
    try {
        await prisma.$connect();

        console.log("Conectado a MySQL mediante Prisma");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
        process.exit(1);
    }
}

startServer();