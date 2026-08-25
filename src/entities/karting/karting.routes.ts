import { Router } from "express";
import kartingController from "./karting.controller";

const router = Router();


router.get("/", kartingController.getAll);
router.get("/:id", kartingController.getById);

export default router;
