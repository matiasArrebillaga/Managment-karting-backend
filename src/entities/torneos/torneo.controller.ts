import { Request, Response, NextFunction} from "express";
import { CreateTorneos, UpdateTorneos } from "./torneo.interface";
import TorneosService from "./torneo.service";


class TorneosController {

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {

            const torneos = await TorneosService.getAll();

            res.json(torneos);

        }

catch (error) {
            next(error);
        }

    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {

            const id = Number(req.params.id);

            const torneo = await TorneosService.getById(id);

            if (!torneo) {
                return res.status(404).json({
                    message: "Torneo no encontrado"
                });
            }

            res.json(torneo);

        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data: CreateTorneos = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                cupoMaximo: Number(req.body.cupoMaximo),
                fechaInicio: new Date(req.body.fechaInicio),
                fechaFin: new Date(req.body.fechaFin)
            };

            const nuevoTorneo = await TorneosService.create(data);

            res.status(201).json(nuevoTorneo);

        } catch (error: any) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {

            const id = Number(req.params.id);

            const data: UpdateTorneos = req.body;

            const torneoActualizado = await TorneosService.update(id, data);

            if (!torneoActualizado) {
                return res.status(404).json({
                    message: "Torneo no encontrado"
                });
            }

            res.status(200).json(torneoActualizado);

        } catch (error: any) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {

            const id = Number(req.params.id);

            const torneoEliminado =
                await TorneosService.delete(id);

            if (!torneoEliminado) {
                return res.status(404).json({
                    message: "Torneo no encontrado"
                });
            }

            res.status(200).json(torneoEliminado);

        } catch (error) {
            next(error);
        }
    }

}

export default new TorneosController();
