import express from "express";
import cors from "cors";
import kartingRoutes from "./entities/karting/karting.routes";
import personaRoutes from "./entities/persona/persona.routes";
import localidadRoutes from "./entities/localidad/localidad.routes";
import circuitoRoutes from "./entities/circuito/circuito.routes";
import authRoutes from "./entities/auth/auth.routes";
import rolRoutes from "./entities/rol/rol.routes";
import { AuthRequest, verifyToken } from "./middleware/auth.middleware";
import tipoLicenciasRouters from "./entities/tipoLicencia/tiposLicencias.routes";
import tipoKartingRouters from "./entities/tipoKarting/tiposKarting.routes";
import torneo from "./entities/torneos/torneo.routes";
import licenciaRoutes from "./entities/licencia/licencia.routes";
import reservaRoutes from "./entities/reserva/reserva.routes";
import carreraRoutes from "./entities/carrera/carrera.routes";
import participacionRoutes from "./entities/participacion/participacion.routes";
import inscripcionRoutes from "./entities/inscripcion/inscripcion.routes";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "./config/openapi";

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true
}));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get("/api-docs.json", (req, res) => {
    res.json(openapiSpec);
});

// Ruta para obtener el token
app.use("/api/auth", authRoutes);

// Rutas protegidas
app.use("/api/kartings", verifyToken, kartingRoutes);
app.use("/api/personas", verifyToken, personaRoutes);
app.use("/api/localidades", verifyToken, localidadRoutes);
app.use("/api/circuitos", verifyToken, circuitoRoutes);
app.use("/api/roles", verifyToken, rolRoutes);
app.use("/api/tiposLicencias", verifyToken, tipoLicenciasRouters);
app.use("/api/tiposKartings", verifyToken, tipoKartingRouters);
app.use("/api/torneos", verifyToken, torneo);
app.use("/api/licencias", verifyToken, licenciaRoutes);
app.use("/api/reservas", verifyToken, reservaRoutes);
app.use("/api/carreras", verifyToken, carreraRoutes);
app.use("/api/participaciones", verifyToken, participacionRoutes);
app.use("/api/inscripciones", verifyToken, inscripcionRoutes);
app.get("/", (req, res) => {
    res.send("API funcionando");
});

export default app;
