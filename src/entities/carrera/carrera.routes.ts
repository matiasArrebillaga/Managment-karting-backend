
import { Router } from "express";
import CarrerasController from "./carrera.controller";

const carrera = Router();

carrera.get("/", CarrerasController.getAll);

carrera.get(
    "/:fechaCarrera/:Kartings_idKartings/:Torneos_idTorneos/:Circuitos_idCircuitos",
    CarrerasController.getById
);

carrera.post("/", CarrerasController.create);

carrera.put(
    "/:fechaCarrera/:Kartings_idKartings/:Torneos_idTorneos/:Circuitos_idCircuitos",
    CarrerasController.update
);

carrera.delete(
    "/:fechaCarrera/:Kartings_idKartings/:Torneos_idTorneos/:Circuitos_idCircuitos",
    CarrerasController.delete
);

export default carrera;