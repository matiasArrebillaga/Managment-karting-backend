
import { Router } from "express";
import PersonasTorneosController from "./inscripcion.controller";

const personasTorneos = Router();

personasTorneos.get(
    "/",
    PersonasTorneosController.getAll
);

personasTorneos.get(
    "/:Torneos_idTorneos/:Personas_idPersona",
    PersonasTorneosController.getById
);

personasTorneos.post(
    "/",
    PersonasTorneosController.create
);

personasTorneos.put(
    "/:Torneos_idTorneos/:Personas_idPersona",
    PersonasTorneosController.update
);

personasTorneos.delete(
    "/:Torneos_idTorneos/:Personas_idPersona",
    PersonasTorneosController.delete
);

export default personasTorneos;
