import {Request , Response} from "express";
import rolService from "./rol.service";
import { IRol } from "./rol.interface";

class RolController{
    async getAll(req: Request, res: Response){
        try{
            const roles = await rolService.getAll();
            res.json(roles);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener los roles"
            });
        }
    }
    async getById (req: Request, res: Response){
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
            res.status(500).json({
               message: "Error al obtener el rol"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: IRol = req.body
            const nuevoRol = await rolService.create(data);
            res.status(201).json(nuevoRol);
        }catch (error){
        res.status(500).json({
            message:"Error al crear el rol"
        });
    }
    }
    async update (req: Request, res:Response){
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
            res.status(500).json({
                message:"Error al actualizar el rol"
            });
        }
    }
    async delete (req: Request, res: Response){
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
            res.status(500).json ({
                message:"Error al eliminar el rol"
            });
        }
    }
}
export default new RolController();