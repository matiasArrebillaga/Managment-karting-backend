
import { Request, Response } from "express";

import reservaService from "./reserva.service";

import { IReserva } from "./reserva.interface";

class ReservaController {

    async getAll(req: Request, res: Response) {
        try {
            const reservas = await reservaService.getAll();

            res.json(reservas);

        } catch (error) {
            res.status(500).json({
                message: "Error al obtener las reservas"
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            //Falta validar el tipo de dato que tendra la variable reserva
            const reserva =
                await reservaService.getById(id);

            if (!reserva) {
                return res.status(404).json({
                    message: "Reserva no encontrada"
                });
            }

            res.json(reserva);

        } catch (error) {
            res.status(500).json({
                message: "Error al obtener la reserva"
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const data: IReserva = req.body;

            const nuevaReserva =
                await reservaService.create(data);

            res.status(201).json(nuevaReserva);

        } catch (error) {
            res.status(500).json({
                message: "Error al crear la reserva"
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            const reservaActualizada =
                await reservaService.update(id, req.body);

            if (!reservaActualizada) {
                return res.status(404).json({
                    message: "Reserva no encontrada"
                });
            }

            res.status(200).json(reservaActualizada);

        } catch (error) {
            res.status(500).json({
                message: "Error al actualizar la reserva"
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            const reservaEliminada =
                await reservaService.delete(id);

            if (!reservaEliminada) {
                return res.status(404).json({
                    message: "Reserva no encontrada"
                });
            }

            res.status(200).json(reservaEliminada);

        } catch (error) {
            res.status(500).json({
                message: "Error al eliminar la reserva"
            });
        }
    }
}

export default new ReservaController();

