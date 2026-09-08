
import { Request, Response } from "express";
import ParticipacionesService from "./participacion.service";

class ParticipacionesController {

    // Obtener todas las participaciones
    async getAll(req: Request, res: Response) {
        try {
            const participaciones = await ParticipacionesService.getAll();

            res.status(200).json(participaciones);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener las participaciones"
            });
        }
    }

    // Obtener una participación por su clave primaria compuesta
    async getById(req: Request, res: Response) {
        try {
            const Carrera_Kartings_idKartings =
                Number(req.params.Carrera_Kartings_idKartings);

            const Carrera_Torneos_idTorneos =
                Number(req.params.Carrera_Torneos_idTorneos);

            const Carrera_Circuitos_idCircuitos =
                Number(req.params.Carrera_Circuitos_idCircuitos);

            const Carrera_fecha =
                new Date(String(req.params.Carrera_fecha));

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            const participacion =
                await ParticipacionesService.getById(
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                );

            if (!participacion) {
                return res.status(404).json({
                    message: "Participación no encontrada"
                });
            }

            res.status(200).json(participacion);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener la participación"
            });
        }
    }

    // Crear una participación
    async create(req: Request, res: Response) {
        try {
            const data = {
                Carrera_Kartings_idKartings:
                    Number(req.body.Carrera_Kartings_idKartings),

                Carrera_Torneos_idTorneos:
                    Number(req.body.Carrera_Torneos_idTorneos),

                Carrera_Circuitos_idCircuitos:
                    Number(req.body.Carrera_Circuitos_idCircuitos),

                Carrera_fecha:
                    new Date(String(req.body.Carrera_fecha)),

                Personas_idPersona:
                    Number(req.body.Personas_idPersona),

                puntos:
                    Number(req.body.puntos),

                tiempo:
                    String(req.body.tiempo),

                posicion_final:
                    String(req.body.posicion_final)
            };

            const participacion =
                await ParticipacionesService.create(data);

            res.status(201).json(participacion);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al crear la participación"
            });
        }
    }

    // Actualizar una participación
    async update(req: Request, res: Response) {
        try {
            const Carrera_Kartings_idKartings =
                Number(req.params.Carrera_Kartings_idKartings);

            const Carrera_Torneos_idTorneos =
                Number(req.params.Carrera_Torneos_idTorneos);

            const Carrera_Circuitos_idCircuitos =
                Number(req.params.Carrera_Circuitos_idCircuitos);

            const Carrera_fecha =
                new Date(String(req.params.Carrera_fecha));

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            const data = {
                ...(req.body.puntos !== undefined && {
                    puntos: Number(req.body.puntos)
                }),

                ...(req.body.tiempo !== undefined && {
                    tiempo: String(req.body.tiempo)
                }),

                ...(req.body.posicion_final !== undefined && {
                    posicion_final: String(req.body.posicion_final)
                })
            };

            const participacion =
                await ParticipacionesService.update(
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona,
                    data
                );

            res.status(200).json(participacion);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al actualizar la participación"
            });
        }
    }

    // Eliminar una participación
    async delete(req: Request, res: Response) {
        try {
            const Carrera_Kartings_idKartings =
                Number(req.params.Carrera_Kartings_idKartings);

            const Carrera_Torneos_idTorneos =
                Number(req.params.Carrera_Torneos_idTorneos);

            const Carrera_Circuitos_idCircuitos =
                Number(req.params.Carrera_Circuitos_idCircuitos);

            const Carrera_fecha =
                new Date(String(req.params.Carrera_fecha));

            const Personas_idPersona =
                Number(req.params.Personas_idPersona);

            await ParticipacionesService.delete(
                Carrera_Kartings_idKartings,
                Carrera_Torneos_idTorneos,
                Carrera_Circuitos_idCircuitos,
                Carrera_fecha,
                Personas_idPersona
            );

            res.status(200).json({
                message: "Participación eliminada correctamente"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al eliminar la participación"
            });
        }
    }
}

export default new ParticipacionesController();
