import { Router } from "express";
import circuitoController from "./circuito.controller";

const router = Router();


router.get("/", circuitoController.getAll);
router.get("/:id", circuitoController.getById);
router.post("/", circuitoController.create);
router.patch("/:id", circuitoController.update);
router.delete("/:id",circuitoController.delete);
export default router;
