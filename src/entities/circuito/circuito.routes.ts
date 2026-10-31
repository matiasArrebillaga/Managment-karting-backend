import { Router } from "express";
import { requireFields } from "../../middleware/error.middleware";
import circuitoController from "./circuito.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


router.get("/",verifyRoles("EMPLEADO","CLIENTE","ADMIN"), circuitoController.getAll);
router.get("/:id",verifyRoles("EMPLEADO","CLIENTE","ADMIN"), circuitoController.getById);
router.post("/",verifyRoles("ADMIN"), requireFields("distancia", "dificultad", "maximo"), circuitoController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), circuitoController.update);
router.delete("/:id",verifyRoles("ADMIN"),circuitoController.delete);
export default router;
