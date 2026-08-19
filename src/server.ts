import app from "./app";
import { AppDataSource } from "./config/data-source";

const PORT = 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Conectado a MySQL");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error: unknown) => {
        console.error("Error al conectar con MySQL:", error);
    });