import {Request , Response} from "express";
import { KartingService } from "./karting.service";

const kartingService = new KartingService();

export class kartingController{
    async getAll(req: Request, res: Response){
        try{
            const kartings = await kartingService.getAll();
            res.json(kartings);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener los kartings"
            });
        }
    }
    async getById (req: Request, res: Response){
        try{
            const id = Number(req.params.idKartings)
            const karting= await kartingService.getById(id);
            
            if (!karting){
                return res.status(404).json({
                    message: "Karting no encontrado"
                });
            }
            res.json(karting);
        }catch(error){
            res.status(500).json({
               message: "Error al obtener el karting"
            });
        }
    }
}