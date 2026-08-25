import { Router } from "express";
import kartingController from "./karting.controller";

const router = Router();


router.get("/", kartingController.getAll);
router.get("/:id", kartingController.getById);
router.post("/", kartingController.create);
router.put("/:id", kartingController.update);
router.delete("/:id",kartingController.delete);
export default router;
