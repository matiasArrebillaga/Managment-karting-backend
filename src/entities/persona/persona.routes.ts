import { Router } from "express";
import personaController from "./persona.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


router.get("/", verifyRoles("ADMIN","EMPLEADO"),personaController.getAll);
router.get("/:id",verifyRoles("ADMIN","EMPLEADO"), personaController.getById);
router.post("/",verifyRoles("ADMIN"), personaController.create);
router.patch("/:id",verifyRoles("ADMIN"), personaController.update);
router.delete("/:id",verifyRoles("ADMIN"),personaController.delete);
export default router;
