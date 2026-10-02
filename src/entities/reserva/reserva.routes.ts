import ReservaController from "./reserva.controller";
import {Router} from "express";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();

router.get("/", verifyRoles("ADMIN","EMPLEADO"), ReservaController.getAll);
// /mias va antes de /:id o Express la matchea como id = "mias"
router.get("/mias",verifyRoles("CLIENTE","EMPLEADO","ADMIN"),ReservaController.getMias);
router.get("/:id",verifyRoles("ADMIN","EMPLEADO"),ReservaController.getById);
router.post("/",verifyRoles("CLIENTE","EMPLEADO","ADMIN"), ReservaController.create);
router.patch("/:id",verifyRoles("CLIENTE","EMPLEADO","ADMIN"), ReservaController.update);
// un CLIENTE puede cancelar, pero el service lo limita a las propias
router.delete("/:id",verifyRoles("CLIENTE","EMPLEADO","ADMIN"),ReservaController.delete);

export default router;
