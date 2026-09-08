import ReservaController from "./reserva.controller";
import {Router} from "express";

const router = Router();

router.get("/", ReservaController.getAll);
router.get("/:id", ReservaController.getById);
router.post("/", ReservaController.create);
router.patch("/:id", ReservaController.update);
router.delete("/:id",ReservaController.delete);

export default router;
