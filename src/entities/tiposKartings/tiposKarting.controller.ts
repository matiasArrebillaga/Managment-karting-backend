import {Request , Response} from "express";
import { ITiposKartings } from "./tiposKarting.interface";
import TiposKartingsService from "./tiposKarting.service";


class TiposKartingsController{
    async getAll(req: Request, res: Response){
        try{
            const tiposKartings = await TiposKartingsService.getAll();
            res.json(tiposKartings);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener los tipos de karting"
            });
        }
    }
    async getById (req: Request, res: Response){
        try{
            const id = Number(req.params.id)
            const tiposKartings = await TiposKartingsService.getById(id);
            if (!tiposKartings){
                return res.status(404).json({
                    message: "Tipos de karting no encontrado"
                });
            }
            res.json(tiposKartings);
        }catch(error){
            res.status(500).json({
               message: "Error al obtener los tipos de karting"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: ITiposKartings = req.body
            const nuevoTiposKartings= await TiposKartingsService.create(data);
            res.status(201).json(nuevoTiposKartings);
        }catch (error){
        res.status(500).json({
            message:"Error al crear los tipos de karting"
        });
    } 
    }
    async update (req: Request, res:Response){
        try{
            const id = Number(req.params.id)
            const tiposKartingsActualizado = await TiposKartingsService.update(id,req.body)
            if (!tiposKartingsActualizado){
                return res.status(404).json({
                    message: "Tipos de karting no encontrados"
                })
            }
            res.status(200).json(tiposKartingsActualizado)
        }catch(error){
            res.status(500).json({
                message:"Error al actualizar los tipos de karting"
            });
        }
    }
        async delete (req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            const tiposKartingsEliminado = await TiposKartingsService.delete(id);
            if (!tiposKartingsEliminado){
                return res.status(404).json({
                    message: "Tipos de karting no encontrado"
                });
            }
        }catch (error){
            res.status(500).json ({
                message:"Error al eliminar los tipos de karting"
            });
        }
    }
}
export default new TiposKartingsController();