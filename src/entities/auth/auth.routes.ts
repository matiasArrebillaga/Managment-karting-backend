import { Router } from "express";
import { requireFields } from "../../middleware/error.middleware";
import authController from "./auth.controller";
import localidadController from "../localidad/localidad.controller";


// rutas de login publicas
const router = Router();

router.post("/register", requireFields("nombre", "apellido", "dni", "fechaNacimiento", "mail", "telefono", "contraseña", "Localidades_idLocalidades"), authController.register);
router.post("/login", requireFields("mail", "contraseña"), authController.login);
// publica: el registro necesita las localidades antes de tener token
router.get("/localidades", localidadController.getAll);

export default router;