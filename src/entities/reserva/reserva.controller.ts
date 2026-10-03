import { Request, Response, NextFunction} from "express";

import reservaService from "./reserva.service";
import { AuthRequest, limitarAPropias } from "../../middleware/auth.middleware";


class ReservaController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const reservas = await reservaService.getAll();

            res.json(reservas);
        } catch (error) {
            next(error);
        }
    }

    async getMias(req: AuthRequest, res: Response, next: NextFunction) { // funcion para que el usuario pueda ver sus reservas
        try {
            const reservas = await reservaService.getPorPersona(Number(req.user?.idPersona));

            res.json(reservas);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const reserva = await reservaService.getById(id, limitarAPropias(req));

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

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const nuevaReserva = await reservaService.realizarReserva(
                req.body, limitarAPropias(req)
            );
            res.status(201).json(nuevaReserva);
        } catch (error: any) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const reservaActualizada = await reservaService.update(
                id, req.body, limitarAPropias(req)
            );

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

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            const reservaEliminada = await reservaService.delete(id, limitarAPropias(req));

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
