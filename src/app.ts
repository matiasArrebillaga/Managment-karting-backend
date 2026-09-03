import express from "express"
import kartingRoutes from "./entities/karting/karting.routes"
import personaRoutes from "./entities/persona/persona.routes"
import localidadRoutes from "./entities/localidad/localidad.routes"
import circuitoRoutes from "./entities/circuito/circuito.routes"
import tipoLicenciasRouters from "./entities/tiposLicencias/tiposLicencias.routes"
import tipoKartingRouters from "./entities/tiposKartings/tiposKarting.routes"
import torneo from "./entities/torneos/torneo.routes"


const app = express();
app.use(express.json());

app.use("/api/kartings", kartingRoutes);
app.use("/api/personas",personaRoutes);
app.use("/api/localidades", localidadRoutes);
app.use("/api/circuitos", circuitoRoutes);
app.use("/api/tiposLicencias",tipoLicenciasRouters);
app.use("/api/tiposKartings",tipoKartingRouters);
app.use("/api/torneos",torneo);


app.get("/", (req, res) => {
    res.send("API funcionando");
});

export default app;