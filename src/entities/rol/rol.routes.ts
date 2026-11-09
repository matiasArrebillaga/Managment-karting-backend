import { Router } from "express";
import rolController from "./rol.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const router = Router();

router.get("/",verifyRoles("ADMIN"), rolController.getAll);
router.get("/:id",verifyRoles("ADMIN"), rolController.getById);

export default router;