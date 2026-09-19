import { Router } from "express";
import TiposLicenciasController from "./tiposLicencias.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


router.get("/",verifyRoles("EMPLEADO","ADMIN"), TiposLicenciasController.getAll);
router.get("/:id",verifyRoles("EMPLEADO","ADMIN"), TiposLicenciasController.getById);
router.post("/",verifyRoles("EMPLEADO","ADMIN"), TiposLicenciasController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), TiposLicenciasController.update);
router.delete("/:id",verifyRoles("ADMIN"),TiposLicenciasController.delete);
export default router;