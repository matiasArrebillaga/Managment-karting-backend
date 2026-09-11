
import { Router } from "express";
import CarrerasController from "./carrera.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const carrera = Router();

carrera.get("/", verifyRoles("EMPLEADO","CLIENTE","ADMIN"),CarrerasController.getAll);

carrera.get(
    "/:fechaCarrera/:Kartings_idKartings/:Torneos_idTorneos/:Circuitos_idCircuitos",
    verifyRoles("EMPLEADO","CLIENTE","ADMIN"),
    CarrerasController.getById
);

carrera.post("/",verifyRoles("EMPLEADO","ADMIN"), CarrerasController.create);

carrera.put(
    "/:fechaCarrera/:Kartings_idKartings/:Torneos_idTorneos/:Circuitos_idCircuitos",
    verifyRoles("EMPLEADO","ADMIN"),
    CarrerasController.update
);

carrera.delete(
    "/:fechaCarrera/:Kartings_idKartings/:Torneos_idTorneos/:Circuitos_idCircuitos",
    verifyRoles("ADMIN"),
    CarrerasController.delete
);

export default carrera;