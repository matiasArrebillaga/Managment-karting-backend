import { Router } from "express";
import TiposLicenciasController from "./tiposLicencias.controller";

const router = Router();


router.get("/", TiposLicenciasController.getAll);
router.get("/:id", TiposLicenciasController.getById);
router.post("/", TiposLicenciasController.create);
router.patch("/:id", TiposLicenciasController.update);
router.delete("/:id",TiposLicenciasController.delete);
export default router;