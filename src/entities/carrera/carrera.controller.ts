
import { Request, Response, NextFunction} from "express";
import CarrerasService from "./carrera.service";

class CarrerasController {

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const carreras = await CarrerasService.getAll();

            res.status(200).json(carreras);

        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const fechaCarrera = new Date(String(req.params.fechaCarrera));
            const Kartings_idKartings = Number(req.params.Kartings_idKartings);
            const Torneos_idTorneos = Number(req.params.Torneos_idTorneos);
            const Circuitos_idCircuitos = Number(req.params.Circuitos_idCircuitos);

            const carrera = await CarrerasService.getById(
                fechaCarrera,
                Kartings_idKartings,
                Torneos_idTorneos,
                Circuitos_idCircuitos
            );

            if (!carrera) {
                return res.status(404).json({
                    message: "Carrera no encontrada"
                });
            }

            res.status(200).json(carrera);

        } catch (error) {
            next(error);
        }
    }

async create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = {
            fechaCarrera: new Date(req.body.fechaCarrera),
            horaInicio: new Date(req.body.horaInicio),
            horaFin: new Date(req.body.horaFin),
            Kartings_idKartings: Number(req.body.Kartings_idKartings),
            Torneos_idTorneos: Number(req.body.Torneos_idTorneos),
            Circuitos_idCircuitos: Number(req.body.Circuitos_idCircuitos)
        };

        const carrera = await CarrerasService.crearCarrera(data);
        res.status(201).json(carrera);

    } catch (error: any) {
            next(error);
        }
}

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const fechaCarrera = new Date(String(req.params.fechaCarrera));
            const Kartings_idKartings = Number(req.params.Kartings_idKartings);
            const Torneos_idTorneos = Number(req.params.Torneos_idTorneos);
            const Circuitos_idCircuitos = Number(req.params.Circuitos_idCircuitos);

            const data = {
                ...(req.body.horaInicio !== undefined && {
                    horaInicio: new Date(req.body.horaInicio)
                }),
                ...(req.body.horaFin !== undefined && {
                    horaFin: new Date(req.body.horaFin)
                })
            };

            const carrera = await CarrerasService.update(
                fechaCarrera,
                Kartings_idKartings,
                Torneos_idTorneos,
                Circuitos_idCircuitos,
                data
            );

            res.status(200).json(carrera);

        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const fechaCarrera = new Date(String(req.params.fechaCarrera));
            const Kartings_idKartings = Number(req.params.Kartings_idKartings);
            const Torneos_idTorneos = Number(req.params.Torneos_idTorneos);
            const Circuitos_idCircuitos = Number(req.params.Circuitos_idCircuitos);

            await CarrerasService.delete(
                fechaCarrera,
                Kartings_idKartings,
                Torneos_idTorneos,
                Circuitos_idCircuitos
            );

            res.status(200).json({
                message: "Carrera eliminada correctamente"
            });

        } catch (error) {
            next(error);
        }
    }
    async getByTorneo(req: Request, res: Response, next: NextFunction) {
    try {
        const idTorneo = Number(req.params.idTorneo);
        const carreras = await CarrerasService.getByTorneo(idTorneo);
        res.status(200).json(carreras);
    } catch (error) {
            next(error);
        }
}
}

export default new CarrerasController();

