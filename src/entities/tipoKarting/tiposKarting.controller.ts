import {Request , Response, NextFunction} from "express";
import { ITiposKartings } from "./tiposKarting.interface";
import TiposKartingsService from "./tiposKarting.service";


class TiposKartingsController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const tiposKartings = await TiposKartingsService.getAll();
            res.json(tiposKartings);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
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
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: ITiposKartings = req.body
            const nuevoTiposKartings= await TiposKartingsService.create(data);
            res.status(201).json(nuevoTiposKartings);
        }catch (error){
        next(error);
    } 
    }
    async update (req: Request, res:Response, next: NextFunction){
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
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const tiposKartingsEliminado = await TiposKartingsService.delete(id);
            if (!tiposKartingsEliminado){
                return res.status(404).json({
                    message: "Tipos de karting no encontrado"
                });
            }
            res.status(200).json({
                message: "Tipo de karting eliminado correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new TiposKartingsController();