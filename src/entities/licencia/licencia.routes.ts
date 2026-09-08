import LicenciaController from "./licencia.controller";
import {Router} from "express";

const router = Router();

router.get("/", LicenciaController.getAll);
router.get("/:id", LicenciaController.getById);
router.post("/", LicenciaController.create);
router.patch("/:id", LicenciaController.update);
router.delete("/:id",LicenciaController.delete);
export default router;
