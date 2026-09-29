import {Request, Response, NextFunction} from "express";
import kartingService from "./karting.service";
import { IKarting } from "./karting.interface";


class KartingController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const kartings = await kartingService.getAll();
            res.json(kartings);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const karting= await kartingService.getById(id);
            if (!karting){
                return res.status(404).json({
                    message: "Karting no encontrado"
                });
            }
            res.json(karting);
        }catch(error){
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: IKarting = req.body
            const nuevoKarting= await kartingService.create(data);
            res.status(201).json(nuevoKarting);
        }catch (error){
        next(error);
    } 
    }
    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const kartingActualizado = await kartingService.update(id,req.body)
            if (!kartingActualizado){
                return res.status(404).json({
                    message: "Karting no encontrado"
                })
            }
            res.status(200).json(kartingActualizado)
        }catch(error){
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const kartingEliminado = await kartingService.delete(id);
            if (!kartingEliminado){
                return res.status(404).json({
                    message: "Karting no encontrado"
                });
            }
            res.status(200).json({
                message: "Karting eliminado correctamente"
            });            
        }catch (error){
            next(error);
        }
    }
}
export default new KartingController();