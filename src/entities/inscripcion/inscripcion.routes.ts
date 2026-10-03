
import { Router } from "express";
import PersonasTorneosController from "./inscripcion.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const personasTorneos = Router();

personasTorneos.get(
    "/",
    verifyRoles("ADMIN","EMPLEADO"),
    PersonasTorneosController.getAll
);

// /mias va antes de la ruta con parametros o Express la matchea como Torneos_idTorneos = "mias"
personasTorneos.get(
    "/mias",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.getMias
);

personasTorneos.get(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.getById
);

personasTorneos.post(
    "/",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.create
);

// no hay PUT: la fecha y la hora de inscripcion las pone el servidor, asi que una
// inscripcion no tiene ningun campo modificable. Para cambiar de torneo se da de baja.

// un CLIENTE puede darse de baja, pero el service lo limita a la propia y al torneo
// que todavia no empezo
personasTorneos.delete(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.delete
);

export default personasTorneos;
