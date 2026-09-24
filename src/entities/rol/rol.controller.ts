import {Request , Response, NextFunction} from "express";
import rolService from "./rol.service";
import { IRol } from "./rol.interface";

class RolController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const roles = await rolService.getAll();
            res.json(roles);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const rol = await rolService.getById(id);
            if (!rol){
                return res.status(404).json({
                    message: "Rol no encontrado"
                });
            }
            res.json(rol);
        }catch(error){
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: IRol = req.body
            const nuevoRol = await rolService.create(data);
            res.status(201).json(nuevoRol);
        }catch (error){
        next(error);
    }
    }
    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const rolActualizado = await rolService.update(id,req.body)
            if (!rolActualizado){
                return res.status(404).json({
                    message: "Rol no encontrado"
                })
            }
            res.status(200).json(rolActualizado)
        }catch(error){
            next(error);
        }
    }
    async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const rolEliminado = await rolService.delete(id);
            if (!rolEliminado){
                return res.status(404).json({
                    message: "Rol no encontrado"
                });
            }
            res.status(200).json({
                message: "Rol eliminado correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new RolController();