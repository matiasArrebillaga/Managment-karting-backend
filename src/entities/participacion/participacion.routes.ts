
import { Router } from "express";
import ParticipacionesController from "./participacion.controller";

const participacion = Router();

// Obtener todas
participacion.get(
    "/",
    ParticipacionesController.getAll
);

// Obtener una por PK compuesta
participacion.get(
    "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona",
    ParticipacionesController.getById
);

// Crear
participacion.post(
    "/",
    ParticipacionesController.create
);

// Actualizar
participacion.put(
    "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona",
    ParticipacionesController.update
);

// Eliminar
participacion.delete(
    "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona",
    ParticipacionesController.delete
);

export default participacion;

