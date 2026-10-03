
import { Router } from "express";
import ParticipacionesController from "./participacion.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const PK = "/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona";

const participacion = Router();

// Los resultados los carga el personal; un CLIENTE solo ve la tabla general
participacion.get("/", verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.getAll);
// Antes del GET por PK: los dos tienen 5 segmentos y el de PK tomaria "carrera" como fecha
participacion.get(
    "/carrera/:Carrera_fecha/:Carrera_Kartings_idKartings/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos",
    verifyRoles("ADMIN", "EMPLEADO", "CLIENTE"),
    ParticipacionesController.getClasificacionCarrera
);
participacion.get(PK, verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.getById);
participacion.post("/", verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.create);
// Clasificación completa de una carrera, en una transacción
participacion.post("/carrera", verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.registrarCarrera);
participacion.put(PK, verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.update);
participacion.delete(PK, verifyRoles("ADMIN"), ParticipacionesController.delete);
participacion.get("/torneo/:idTorneo/tabla-general", verifyRoles("ADMIN", "EMPLEADO", "CLIENTE"), ParticipacionesController.getTablaGeneral);

export default participacion;
