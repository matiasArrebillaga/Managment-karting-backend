
import { Request, Response } from "express";
import PersonasTorneosService from "./inscripcion.service";

class PersonasTorneosController {

    async getAll(req: Request, res: Response) {
        try {
            const inscripciones =
                await PersonasTorneosService.getAll();

            res.status(200).json(inscripciones);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Error al obtener las inscripciones"
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const Torneos_idTorneos =
                Number(req.params.Torneos_idTorneos);

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            const inscripcion =
                await PersonasTorneosService.getById(
                    Torneos_idTorneos,
                    Personas_idPersona
                );

            if (!inscripcion) {
                return res.status(404).json({
                    message: "Inscripción no encontrada"
                });
            }

            res.status(200).json(inscripcion);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Error al obtener la inscripción"
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const data = {
                Torneos_idTorneos:
                    Number(req.body.Torneos_idTorneos),

                Personas_idPersona:
                    Number(req.body.Personas_idPersona),

                fecha_inscipcion:
                    new Date(String(req.body.fecha_inscipcion)),

                hora_inscripcion:
                    new Date(String(req.body.hora_inscripcion))
            };

            const inscripcion =
                await PersonasTorneosService.create(data);

            res.status(201).json(inscripcion);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Error al crear la inscripción"
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const Torneos_idTorneos =
                Number(req.params.Torneos_idTorneos);

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            const data = {
                ...(req.body.fecha_inscipcion !== undefined && {
                    fecha_inscipcion:
                        new Date(req.body.fecha_inscipcion)
                }),

                ...(req.body.hora_inscripcion !== undefined && {
                    hora_inscripcion:
                        new Date(req.body.hora_inscripcion)
                })
            };

            const inscripcion =
                await PersonasTorneosService.update(
                    Torneos_idTorneos,
                    Personas_idPersona,
                    data
                );

            res.status(200).json(inscripcion);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Error al actualizar la inscripción"
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const Torneos_idTorneos =
                Number(req.params.Torneos_idTorneos);

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            await PersonasTorneosService.delete(
                Torneos_idTorneos,
                Personas_idPersona
            );

            res.status(200).json({
                message: "Inscripción eliminada correctamente"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Error al eliminar la inscripción"
            });
        }
    }
}

export default new PersonasTorneosController();

