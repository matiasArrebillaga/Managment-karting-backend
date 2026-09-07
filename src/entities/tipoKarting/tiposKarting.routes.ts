import { Router } from "express";
import TiposKartingsController from "./tiposKarting.controller";

const router = Router();


router.get("/", TiposKartingsController.getAll);
router.get("/:id", TiposKartingsController.getById);
router.post("/", TiposKartingsController.create);
router.patch("/:id", TiposKartingsController.update);
router.delete("/:id",TiposKartingsController.delete);

export default router;