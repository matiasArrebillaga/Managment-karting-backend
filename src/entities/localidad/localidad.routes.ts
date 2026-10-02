import { Router } from "express";
import localidadController from "./localidad.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const router = Router();

//estas son las rutas desde las que se acceden
// tienen el prefijo api/localidad ej api/localidad/id

//READ
router.get("/",verifyRoles("CLIENTE","EMPLEADO"), localidadController.getAll);
router.get("/:id",verifyRoles("CLIENTE","EMPLEADO"), localidadController.getById);

//CREATE
router.post("/",verifyRoles("ADMIN","EMPLEADO"), localidadController.create);

//UPDATE
router.patch("/:id",verifyRoles("ADMIN","EMPLEADO"), localidadController.update);

//DELETE
router.delete("/:id",verifyRoles("ADMIN","EMPLEADO"),localidadController.delete);

export default router;
