import { Router } from "express";
import { requireFields } from "../../middleware/error.middleware";
import TiposLicenciasController from "./tiposLicencias.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


// el cliente puede leer porque los torneos filtran por licencia
router.get("/",verifyRoles("CLIENTE","EMPLEADO","ADMIN"), TiposLicenciasController.getAll);
router.get("/:id",verifyRoles("CLIENTE","EMPLEADO","ADMIN"), TiposLicenciasController.getById);
router.post("/",verifyRoles("EMPLEADO","ADMIN"), requireFields("nombre", "descripcion", "nivel"), TiposLicenciasController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), TiposLicenciasController.update);
router.delete("/:id",verifyRoles("ADMIN"),TiposLicenciasController.delete);
export default router;