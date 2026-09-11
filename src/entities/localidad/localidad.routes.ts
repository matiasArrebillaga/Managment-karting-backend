import { Router } from "express";
import localidadController from "./localidad.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();


router.get("/",verifyRoles("CLIENTE,EMPLEADO"), localidadController.getAll);
router.get("/:id",verifyRoles("CLIENTE,EMPLEADO"), localidadController.getById);
router.post("/",verifyRoles("ADMIN","EMPLEADO"), localidadController.create);
router.patch("/:id",verifyRoles("ADMIN","EMPLEADO"), localidadController.update);
router.delete("/:id",verifyRoles("ADMIN","EMPLEADO"),localidadController.delete);
export default router;
