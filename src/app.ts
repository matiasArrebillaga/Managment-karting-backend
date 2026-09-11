import express from "express";

import kartingRoutes from "./entities/karting/karting.routes";
import personaRoutes from "./entities/persona/persona.routes";
import localidadRoutes from "./entities/localidad/localidad.routes";
import circuitoRoutes from "./entities/circuito/circuito.routes";
import authRoutes from "./entities/auth/auth.routes";
import rolRoutes from "./entities/rol/rol.routes";
import { verifyToken } from "./middleware/auth.middleware";
import tipoLicenciasRouters from "./entities/tipoLicencia/tiposLicencias.routes";
import tipoKartingRouters from "./entities/tipoKarting/tiposKarting.routes";
import torneo from "./entities/torneos/torneo.routes";
import licenciaRoutes from "./entities/licencia/licencia.routes";
import reservaRoutes from "./entities/reserva/reserva.routes";
import carreraRoutes from "./entities/carrera/carrera.routes";
import participacionRoutes from "./entities/participacion/participacion.routes";
import inscripcionRoutes from "./entities/inscripcion/inscripcion.routes";

const app = express();

app.use(express.json());

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