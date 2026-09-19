import LicenciaController from "./licencia.controller";
import {Router} from "express";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();

router.get("/",verifyRoles("EMPLEADO","ADMIN"), LicenciaController.getAll);
router.get("/:id",verifyRoles("ADMIN","EMPLEADO"), LicenciaController.getById);
router.post("/",verifyRoles("EMPLEADO"), LicenciaController.create);
router.patch("/:id", verifyRoles("EMPLEADO"),LicenciaController.update);
router.delete("/:id",verifyRoles("ADMIN"),LicenciaController.delete);
export default router;
