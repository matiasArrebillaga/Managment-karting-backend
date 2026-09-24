import {Request , Response, NextFunction} from "express";
import localidadService from "./localidad.service";
import { ILocalidad } from "./localidad.interface";


class LocalidadController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const localidades = await localidadService.getAll();
            res.json(localidades);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const localidad= await localidadService.getById(id);
            if (!localidad){
                return res.status(404).json({
                    message: "Localidad no encontrado"
                });
            }
            res.json(localidad);
        }catch(error){
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: ILocalidad = req.body
            const nuevoLocalidad= await localidadService.create(data);
            res.status(201).json(nuevoLocalidad);
        }catch (error){
        next(error);
    } 
    }
    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const localidadActualizado = await localidadService.update(id,req.body)
            if (!localidadActualizado){
                return res.status(404).json({
                    message: "Localidad no encontrada"
                })
            }
            res.status(200).json(localidadActualizado)
        }catch(error){
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const localidadEliminado = await localidadService.delete(id);
            if (!localidadEliminado){
                return res.status(404).json({
                    message: "Localidad no encontrada"
                });
            }
                res.status(200).json({
                message: "Localidad eliminada correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new LocalidadController();