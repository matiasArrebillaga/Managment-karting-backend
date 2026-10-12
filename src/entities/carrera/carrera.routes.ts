
import { Router } from "express";
import CarrerasController from "./carrera.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const carrera = Router();

carrera.get("/", verifyRoles("EMPLEADO","CLIENTE","ADMIN"),CarrerasController.getAll);

carrera.get(
    "/:fechaCarrera/:Torneos_idTorneos/:Circuitos_idCircuitos",
    verifyRoles("EMPLEADO","CLIENTE","ADMIN"),
    CarrerasController.getById
);

carrera.post("/",verifyRoles("EMPLEADO","ADMIN"), CarrerasController.create);

carrera.put(
    "/:fechaCarrera/:Torneos_idTorneos/:Circuitos_idCircuitos",
    verifyRoles("EMPLEADO","ADMIN"),
    CarrerasController.update
);

carrera.delete(
    "/:fechaCarrera/:Torneos_idTorneos/:Circuitos_idCircuitos",
    verifyRoles("ADMIN"),
    CarrerasController.delete
);
carrera.get("/torneo/:idTorneo",verifyRoles("EMPLEADO","CLIENTE","ADMIN"), CarrerasController.getByTorneo);
export default carrera;