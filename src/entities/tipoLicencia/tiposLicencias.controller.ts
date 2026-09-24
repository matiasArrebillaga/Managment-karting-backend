import {Request , Response, NextFunction} from "express";
import { ITiposLicencias } from "./tiposLicencias.interface";
import tiposLicenciasService from "./tiposLicencias.service";

class TiposLicenciasController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const tiposLicencias = await tiposLicenciasService.getAll();
            res.json(tiposLicencias);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const tiposLicencias = await tiposLicenciasService.getById(id);
            if (!tiposLicencias){
                return res.status(404).json({
                    message: "Tipos de licencias no encontrado"
                });
            }
            res.json(tiposLicencias);
        }catch(error){
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: ITiposLicencias = req.body
            const nuevoTiposLicencias= await tiposLicenciasService.create(data);
            res.status(201).json(nuevoTiposLicencias);
        }catch (error){
        next(error);
    } 
    }
    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const tiposLicenciasActualizado = await tiposLicenciasService.update(id,req.body)
            if (!tiposLicenciasActualizado){
                return res.status(404).json({
                    message: "Tipos de licencias no encontrados"
                })
            }
            res.status(200).json(tiposLicenciasActualizado)
        }catch(error){
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const tiposLicenciasEliminado = await tiposLicenciasService.delete(id);
            if (!tiposLicenciasEliminado){
                return res.status(404).json({
                    message: "Tipos de licencias no encontrado"
                });
            }
            res.status(200).json({
                message: "Tipo de licencia eliminado correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new TiposLicenciasController();