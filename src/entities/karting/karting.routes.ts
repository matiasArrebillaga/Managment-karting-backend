import { Router } from "express";
import { requireFields } from "../../middleware/error.middleware";
import kartingController from "./karting.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();


router.get("/",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), kartingController.getAll);
// va antes de "/:id": si no, "disponibles" se tomaria como un id
router.get("/disponibles",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), kartingController.getDisponibles);
router.get("/:id",verifyRoles("EMPLEADO","ADMIN","CLIENTE"), kartingController.getById);
router.post("/",verifyRoles("EMPLEADO","ADMIN"), requireFields("categoria", "modelo", "estado", "fechaAdquisicion", "TiposKarting_idTiposKarting"), kartingController.create);
router.patch("/:id",verifyRoles("EMPLEADO","ADMIN"), kartingController.update);
router.delete("/:id",verifyRoles("EMPLEADO","ADMIN"),kartingController.delete);
export default router;
