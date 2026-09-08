import {Request, Response} from "express";
import circuitoService from "./circuito.service"
import { ICircuito } from "./circuto.interface";

class CircuitoController{
    async getAll(req: Request, res: Response){
        try{
            const circuitos = await circuitoService.getAll();
            res.json(circuitos);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener los circuitos"
            });
        }
    }
    async getById (req: Request, res: Response){
        try{
            const id = Number(req.params.id)
            const circuito= await circuitoService.getById(id);
            if (!circuito){
                return res.status(404).json({
                    message: "Circuito no encontrado"
                });
            }
            res.json(circuito);
        }catch(error){
            res.status(500).json({
               message: "Error al obtener el circuito"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: ICircuito = req.body
            const nuevoCircuito= await circuitoService.create(data);
            res.status(201).json(nuevoCircuito);
        }catch (error){
        res.status(500).json({
            message:"Error al crear el circuito"
        });
    } 
    }
    async update (req: Request, res:Response){
        try{
            const id = Number(req.params.id)
            const circuitoActualizado = await circuitoService.update(id,req.body)
            if (!circuitoActualizado){
                return res.status(404).json({
                    message: "Circuito no encontrado"
                })
            }
            res.status(200).json(circuitoActualizado)
        }catch(error){
            res.status(500).json({
                message:"Error al Actualizar el circuito"
            });
        }
    }
        async delete (req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            const circuitoEliminado = await circuitoService.delete(id);
            if (!circuitoEliminado){
                return res.status(404).json({
                    message: "Circuito no encontrado"
                });
            }
            res.status(200).json({
                message: "Circuito eliminado correctamente"
            });            
        }catch (error){
            res.status(500).json ({
                message:"Error al eliminar el circuito"
            });
        }
    }
}
export default new CircuitoController();