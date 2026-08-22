import { Router } from "express";
import { kartingController } from "./karting.controller";

const router = Router();

const controller = new kartingController();

router.get("/", controller.getAll.bind(controller));
router.get("/id", controller.getById.bind(controller));

export default router;
