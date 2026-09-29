import { Request, Response, NextFunction} from "express";

import reservaService from "./reserva.service";

import { IReserva } from "./reserva.interface";

class ReservaController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const reservas = await reservaService.getAll();

            res.json(reservas);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            //Falta validar el tipo de dato que tendra la variable reserva
            const reserva = await reservaService.getById(id);

            if (!reserva) {
                return res.status(404).json({
                    message: "Reserva no encontrada",
                });
            }

            res.json(reserva);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data: IReserva = req.body;
            const nuevaReserva = await reservaService.realizarReserva(data);
            res.status(201).json(nuevaReserva);
        } catch (error: any) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const reservaActualizada = await reservaService.update(id, req.body);

            if (!reservaActualizada) {
                return res.status(404).json({
                    message: "Reserva no encontrada",
                });
            }

            res.status(200).json(reservaActualizada);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const reservaEliminada = await reservaService.delete(id);

            if (!reservaEliminada) {
                return res.status(404).json({
                    message: "Reserva no encontrada",
                });
            }

            res.status(200).json(reservaEliminada);
        } catch (error) {
            next(error);
        }
    }
}

export default new ReservaController();
