import { Router } from "express";
import TorneoController from "./torneo.controller";

const router = Router();


router.get("/", TorneoController.getAll);
router.get("/:id", TorneoController.getById);
router.post("/", TorneoController.create);
router.patch("/:id", TorneoController.update);
router.delete("/:id",TorneoController.delete);

export default router;