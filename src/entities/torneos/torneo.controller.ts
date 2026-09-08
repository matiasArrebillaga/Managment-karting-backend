import { Request, Response } from "express";
import { ITorneos } from "./torneo.interface";
import TorneosService from "./torneo.service";


class TorneosController {

    async getAll(req: Request, res: Response) {
        try {

            const torneos = await TorneosService.getAll();

            res.json(torneos);

        }

catch (error) {

    console.log(error);

    res.status(500).json({
        message: "Error al obtener el torneo",
        error: error
    });

}

    }

    async getById(req: Request, res: Response) {
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

            res.status(500).json({
                message: "Error al obtener el torneo"
            });

        }
    }

    async create(req: Request, res: Response) {
        try {

            const data: ITorneos = req.body;

            const nuevoTorneo = await TorneosService.create(data);

            res.status(201).json(nuevoTorneo);

        } catch (error) {
            console.log(error);

            res.status(500).json({
                message: "Error al crear el torneo"
            });

        }
    }

    async update(req: Request, res: Response) {
        try {

            const id = Number(req.params.id);

            const torneoActualizado =
                await TorneosService.update(id, req.body);

            if (!torneoActualizado) {
                return res.status(404).json({
                    message: "Torneo no encontrado"
                });
            }

            res.status(200).json(torneoActualizado);

        } catch (error) {

            res.status(500).json({
                message: "Error al actualizar el torneo"
            });

        }
    }

    async delete(req: Request, res: Response) {
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

            res.status(500).json({
                message: "Error al eliminar el torneo"
            });

        }
    }

}

export default new TorneosController();
