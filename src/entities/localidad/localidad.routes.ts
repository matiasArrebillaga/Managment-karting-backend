import { Router } from "express";
import localidadController from "./localidad.controller";

const router = Router();


router.get("/", localidadController.getAll);
router.get("/:id", localidadController.getById);
router.post("/", localidadController.create);
router.patch("/:id", localidadController.update);
router.delete("/:id",localidadController.delete);
export default router;
