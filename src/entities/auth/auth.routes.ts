import { Router } from "express";
import authController from "./auth.controller";
import localidadController from "../localidad/localidad.controller";


// rutas de login publicas
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// publica: el registro necesita las localidades antes de tener token
router.get("/localidades", localidadController.getAll);

export default router;