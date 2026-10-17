
import { requireFields } from "../../middleware/error.middleware";
import { Router } from "express";
import PersonasTorneosController from "./inscripcion.controller";
import { verifyRoles } from "../../middleware/auth.middleware";


const personasTorneos = Router();

personasTorneos.get(
    "/",
    verifyRoles("ADMIN","EMPLEADO"),
    PersonasTorneosController.getAll
);

// /mias va antes de la ruta con parametros 
personasTorneos.get(
    "/mias",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.getMias
);

// tambien va antes: si no, "/torneo/5" matchearia "/:Torneos_idTorneos/:Personas_idPersona"
personasTorneos.get(
    "/torneo/:idTorneo",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.getInscriptosTorneo
);

personasTorneos.get(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.getById
);

personasTorneos.post(
    "/",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    requireFields("Torneos_idTorneos"),
    PersonasTorneosController.create
);


personasTorneos.delete(
    "/:Torneos_idTorneos/:Personas_idPersona",
    verifyRoles("CLIENTE","EMPLEADO","ADMIN"),
    PersonasTorneosController.delete
);

export default personasTorneos;
