import { Router } from "express";
import personaController from "./persona.controller";

const router = Router();


router.get("/", personaController.getAll);
router.get("/:id", personaController.getById);
router.post("/", personaController.create);
router.patch("/:id", personaController.update);
router.delete("/:id",personaController.delete);
export default router;
