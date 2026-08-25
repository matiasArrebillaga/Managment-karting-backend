import express from "express"
import kartingRoutes from "./entities/karting/karting.routes"
import personaRoutes from "./entities/persona/persona.routes"
const app = express();
app.use(express.json());
app.use("/api/kartings", kartingRoutes);
app.use("/api/personas",personaRoutes);
app.get("/", (req, res) => {
    res.send("API funcionando");
});

export default app;