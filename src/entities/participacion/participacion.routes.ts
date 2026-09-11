
import { Router } from "express";
import ParticipacionesController from "./participacion.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const participacion = Router();

// Obtener todas
participacion.get(
    "/",verifyRoles("EMPLEADO"),
    ParticipacionesController.getAll
);

// Obtener una por PK compuesta
participacion.get(
    "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona",
    verifyRoles("EMPLEADO"),
    ParticipacionesController.getById
);

// Crear
participacion.post(
    "/",
    verifyRoles("CLIENTE","EMPLEADO"),
    ParticipacionesController.create
);

// Actualizar
participacion.put(
    "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona",
    verifyRoles("EMPLEADO"),
    ParticipacionesController.update
);

// Eliminar
participacion.delete(
    "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona",
    verifyRoles("ADMIN"),
    ParticipacionesController.delete
);

export default participacion;

