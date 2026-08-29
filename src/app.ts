import express from "express"
import kartingRoutes from "./entities/karting/karting.routes"
import personaRoutes from "./entities/persona/persona.routes"
import localidadRoutes from "./entities/localidad/localidad.routes"
import circuitoRoutes from "./entities/circuito/circuito.routes"
import authRoutes from "./entities/auth/auth.routes"
const app = express();
app.use(express.json());

app.use("/api/kartings", kartingRoutes);
app.use("/api/personas",personaRoutes);
app.use("/api/localidades", localidadRoutes);
app.use("/api/circuitos", circuitoRoutes);
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
    res.send("API funcionando");
});

export default app;