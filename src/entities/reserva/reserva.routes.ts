import ReservaController from "./reserva.controller";
import {Router} from "express";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();

router.get("/", verifyRoles("ADMIN","EMPLEADO"), ReservaController.getAll);
router.get("/:id",verifyRoles("ADMIN","EMPLEADO"),ReservaController.getById);
router.post("/",verifyRoles("CLIENTE","EMPLEADO"), ReservaController.create);
router.patch("/:id",verifyRoles("CLIENTE","EMPLEADO"), ReservaController.update);
router.delete("/:id",verifyRoles("EMPLEADO"),ReservaController.delete);

export default router;
