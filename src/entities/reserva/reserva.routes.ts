import ReservaController from "./reserva.controller";
import {Router} from "express";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();

router.get("/", verifyRoles("ADMIN","EMPLEADO"), ReservaController.getAll);
// /mias va antes de /:id usa el token para saber el id
router.get("/mias",verifyRoles("CLIENTE","EMPLEADO","ADMIN"),ReservaController.getMias);
// un CLIENTE puede ver el detalle, pero el service le devuelve 404 si no es suya
router.get("/:id",verifyRoles("CLIENTE","ADMIN","EMPLEADO"),ReservaController.getById);
router.post("/",verifyRoles("CLIENTE","EMPLEADO","ADMIN"), ReservaController.create);
router.patch("/:id",verifyRoles("CLIENTE","EMPLEADO","ADMIN"), ReservaController.update);
// un CLIENTE puede cancelar, pero el service lo limita a las propias
router.delete("/:id",verifyRoles("CLIENTE","EMPLEADO","ADMIN"),ReservaController.delete);

export default router;
