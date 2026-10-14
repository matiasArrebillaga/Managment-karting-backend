import { Router } from "express";
import { requireFields } from "../../middleware/error.middleware";
import personaController from "./persona.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


router.get("/", verifyRoles("ADMIN","EMPLEADO"),personaController.getAll);
router.get("/:id",verifyRoles("ADMIN","EMPLEADO"), personaController.getById);
router.post("/",verifyRoles("ADMIN"), requireFields("nombre", "apellido", "dni", "fechaNacimiento", "mail", "telefono", "contraseña", "Localidades_idLocalidades"), personaController.create);
router.post("/:id/rol",verifyRoles("ADMIN"), requireFields("nombreRol"), personaController.asignarRol);
router.post("/empleado",verifyRoles("ADMIN"), requireFields("nombre", "apellido", "dni", "fechaNacimiento", "mail", "telefono", "contraseña", "Localidades_idLocalidades"), personaController.crearEmpleado);
router.patch("/:id",verifyRoles("ADMIN"), personaController.update);
router.delete("/:id",verifyRoles("ADMIN"),personaController.delete);
export default router;
