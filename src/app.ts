import express from "express"
import kartingRoutes from "./entities/karting/karting.routes"
const app = express();
app.use(express.json());
app.use("/api/kartings", kartingRoutes);
app.get("/", (req, res) => {
    res.send("API funcionando");
});

export default app;