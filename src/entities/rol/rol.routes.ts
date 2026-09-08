import { Router } from "express";
import rolController from "./rol.controller";

const router = Router();

router.get("/", rolController.getAll);
router.get("/:id", rolController.getById);
router.post("/", rolController.create);
router.patch("/:id", rolController.update);
router.delete("/:id", rolController.delete);
export default router;