
import { Router } from "express";
import PersonasTorneosController from "./inscripcion.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const personasTorneos = Router();

personasTorneos.get(
    "/",
    verifyRoles("ADMIN","CLIENTE"),
    PersonasTorneosController.getAll
);

personasTorneos.get(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("EMPLEADO","ADMIN"),
    PersonasTorneosController.getById
);

personasTorneos.post(
    "/",
    verifyRoles("EMPLEADO","CLIENTE"),
    PersonasTorneosController.create
);

personasTorneos.put(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("EMPLEADO","ADMIN"),
    PersonasTorneosController.update
);

personasTorneos.delete(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("ADMIN"),
    PersonasTorneosController.delete
);

export default personasTorneos;
