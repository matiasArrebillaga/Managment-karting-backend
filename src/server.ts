import app from "./app";
import { prisma } from "./config/prisma";

const PORT = 3000;

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