
import { Request, Response, NextFunction} from "express";
import PersonasTorneosService from "./inscripcion.service";
import { AuthRequest, limitarAPropias } from "../../middleware/auth.middleware";

class PersonasTorneosController {

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const inscripciones =
                await PersonasTorneosService.getAll();

            res.status(200).json(inscripciones);

        } catch (error) {
            next(error);
        }
    }

    async getMias(req: AuthRequest, res: Response, next: NextFunction) { // las inscripciones del usuario del token
        try {
            const inscripciones =
                await PersonasTorneosService.getPorPersona(Number(req.user?.idPersona));

            res.status(200).json(inscripciones);

        } catch (error) {
            next(error);
        }
    }

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const Torneos_idTorneos =
                Number(req.params.Torneos_idTorneos);

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            const inscripcion =
                await PersonasTorneosService.getById(
                    Torneos_idTorneos,
                    Personas_idPersona,
                    limitarAPropias(req)
                );

            if (!inscripcion) {
                return res.status(404).json({
                    message: "Inscripción no encontrada"
                });
            }

            res.status(200).json(inscripcion);

        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const inscripcion =
                await PersonasTorneosService.create(
                    req.body, limitarAPropias(req)
                );

            res.status(201).json(inscripcion);

        } catch (error: any) {
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const Torneos_idTorneos =
                Number(req.params.Torneos_idTorneos);

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            await PersonasTorneosService.delete(
                Torneos_idTorneos,
                Personas_idPersona,
                limitarAPropias(req)
            );

            res.status(200).json({
                message: "Inscripción eliminada correctamente"
            });

        } catch (error) {
            next(error);
        }
    }
}

export default new PersonasTorneosController();
