import { Router } from "express";
import authController from "./auth.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

// rutas de login publicas
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;