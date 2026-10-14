import { Router } from "express";
import { requireFields } from "../../middleware/error.middleware";
import rolController from "./rol.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();

router.get("/",verifyRoles("ADMIN"), rolController.getAll);
router.get("/:id",verifyRoles("ADMIN"), rolController.getById);
router.post("/",verifyRoles("ADMIN"), requireFields("nombre"), rolController.create);
router.patch("/:id",verifyRoles("ADMIN"), rolController.update);
router.delete("/:id",verifyRoles("ADMIN"), rolController.delete);
export default router;