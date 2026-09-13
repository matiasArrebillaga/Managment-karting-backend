import { Router } from "express";
import TiposKartingsController from "./tiposKarting.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();


router.get("/", verifyRoles("EMPLEADO","ADMIN","EMPLEADO"),TiposKartingsController.getAll);
router.get("/:id",verifyRoles("EMPLEADO","ADMIN","EMPLEADO"), TiposKartingsController.getById);
router.post("/", verifyRoles("EMPLEADO","ADMIN"),TiposKartingsController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), TiposKartingsController.update);
router.delete("/:id",verifyRoles("ADMIN"),TiposKartingsController.delete);

export default router;