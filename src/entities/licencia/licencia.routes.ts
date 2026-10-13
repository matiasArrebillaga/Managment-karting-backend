import LicenciaController from "./licencia.controller";
import {Router} from "express";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();

router.get("/",verifyRoles("EMPLEADO","ADMIN"), LicenciaController.getAll);
// /mias va antes de /:id, si no Express toma "mias" como un id
router.get("/mias", verifyRoles("CLIENTE","EMPLEADO","ADMIN"), LicenciaController.getMias);
router.get("/:id",verifyRoles("ADMIN","EMPLEADO"), LicenciaController.getById);
router.post("/",verifyRoles("EMPLEADO","ADMIN"), LicenciaController.create);
router.patch("/:id", verifyRoles("EMPLEADO","ADMIN"),LicenciaController.update);
router.delete("/:id",verifyRoles("ADMIN"),LicenciaController.delete);
export default router;
