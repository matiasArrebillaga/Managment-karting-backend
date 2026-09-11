import express from "express";
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
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get("/api-docs.json", (req, res) => {
    res.json(openapiSpec);
});

app.use("/api/kartings", kartingRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/localidades", localidadRoutes);
app.use("/api/circuitos", circuitoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/tiposLicencias", tipoLicenciasRouters);
app.use("/api/tiposKartings", tipoKartingRouters);
app.use("/api/torneos", torneo);
app.use("/api/licencias", licenciaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/carreras", carreraRoutes);
app.use("/api/participaciones", participacionRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
app.get("/", (req, res) => {
    res.send("API funcionando");
});

export default app;
