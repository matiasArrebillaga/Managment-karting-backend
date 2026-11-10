
import { requireFields } from "../../middleware/error.middleware";
import { Router } from "express";
import ParticipacionesController from "./participacion.controller";
import { verifyRoles } from "../../middleware/auth.middleware";

const PK = "/:Carrera_fecha/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos/:Personas_idPersona";

const participacion = Router();

// los resultados los carga el personal, el cliente solo ve la tabla
participacion.get("/", verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.getAll);
// antes del GET por PK, sino toma carrera como fecha
participacion.get(
    "/carrera/:Carrera_fecha/:Carrera_Torneos_idTorneos/:Carrera_Circuitos_idCircuitos",
    verifyRoles("ADMIN", "EMPLEADO", "CLIENTE"),
    ParticipacionesController.getClasificacionCarrera
);
participacion.get(PK, verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.getById);
participacion.post("/", verifyRoles("EMPLEADO", "ADMIN"), requireFields("Carrera_Torneos_idTorneos", "Carrera_Circuitos_idCircuitos", "Carrera_fecha", "Personas_idPersona", "posicion_final", "tiempo"), ParticipacionesController.create);
// clasificacion completa en una transaccion
participacion.post("/carrera", verifyRoles("EMPLEADO", "ADMIN"), requireFields("Carrera_Torneos_idTorneos", "Carrera_Circuitos_idCircuitos", "Carrera_fecha", "resultados"), ParticipacionesController.registrarCarrera);
participacion.put(PK, verifyRoles("EMPLEADO", "ADMIN"), ParticipacionesController.update);
participacion.delete(PK, verifyRoles("ADMIN"), ParticipacionesController.delete);
participacion.get("/torneo/:idTorneo/tabla-general", verifyRoles("ADMIN", "EMPLEADO", "CLIENTE"), ParticipacionesController.getTablaGeneral);

export default participacion;
