import { Router } from "express";
import TorneoController from "./torneo.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


router.get("/",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), TorneoController.getAll);
router.get("/:id",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), TorneoController.getById);
router.post("/",verifyRoles("EMPLEADO","ADMIN"), TorneoController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), TorneoController.update);
router.delete("/:id",verifyRoles("ADMIN"),TorneoController.delete);

export default router;