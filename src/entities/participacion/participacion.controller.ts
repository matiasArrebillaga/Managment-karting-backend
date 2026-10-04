
import { Request, Response, NextFunction} from "express";
import ParticipacionesService from "./participacion.service";

const clavesCarrera = (body: any) => ({
    Carrera_Kartings_idKartings: Number(body.Carrera_Kartings_idKartings),
    Carrera_Torneos_idTorneos: Number(body.Carrera_Torneos_idTorneos),
    Carrera_Circuitos_idCircuitos: Number(body.Carrera_Circuitos_idCircuitos),
    Carrera_fecha: new Date(String(body.Carrera_fecha))
});

const resultado = (fila: any) => ({
    Personas_idPersona: Number(fila?.Personas_idPersona),
    posicion_final: Number(fila?.posicion_final),
    tiempo: String(fila?.tiempo)
});

class ParticipacionesController {

    // Obtener todas las participaciones
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const participaciones = await ParticipacionesService.getAll();

            res.status(200).json(participaciones);

        } catch (error) {
            next(error);
        }
    }

    // Obtener una participación por su clave primaria compuesta
    async getById(req: Request, res: Response, next: NextFunction) {
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
            next(error);
        }
    }

    // Crear una participación (un piloto suelto). Los puntos del body se ignoran.
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = { ...clavesCarrera(req.body), ...resultado(req.body) };

            const participacion = await ParticipacionesService.registrarParticipacion(data);

            res.status(201).json(participacion);

        } catch (error: any) {
            next(error);
        }
    }

    // Cargar la clasificación completa de una carrera
    async registrarCarrera(req: Request, res: Response, next: NextFunction) {
        try {
            if (!Array.isArray(req.body.resultados)) {
                return res.status(400).json({ message: "resultados debe ser una lista" });
            }
            const clasificacion = await ParticipacionesService.registrarResultadosCarrera(
                clavesCarrera(req.body),
                req.body.resultados.map(resultado)
            );

            res.status(201).json(clasificacion);

        } catch (error) {
            next(error);
        }
    }

    // Actualizar una participación
    async update(req: Request, res: Response, next: NextFunction) {
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
                ...(req.body.tiempo !== undefined && {
                    tiempo: String(req.body.tiempo)
                }),

                ...(req.body.posicion_final !== undefined && {
                    posicion_final: Number(req.body.posicion_final)
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
            next(error);
        }
    }

    // Eliminar una participación
    async delete(req: Request, res: Response, next: NextFunction) {
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
            next(error);
        }
    }
    // Clasificación de una carrera, para cualquier usuario logueado
    async getClasificacionCarrera(req: Request, res: Response, next: NextFunction) {
        try {
            const clasificacion = await ParticipacionesService.getClasificacionCarrera(clavesCarrera(req.params));
            res.status(200).json(clasificacion);
        } catch (error) {
            next(error);
        }
    }

    async getTablaGeneral(req: Request, res: Response, next: NextFunction) {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const tabla = await ParticipacionesService.getTablaGeneral(idTorneo);
        res.status(200).json(tabla);
    } catch (error) {
            next(error);
        }
}
}

export default new ParticipacionesController();
