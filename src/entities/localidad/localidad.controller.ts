import {Request , Response} from "express";
import localidadService from "./localidad.service";
import { ILocalidad } from "./localidad.interface";


class LocalidadController{
    async getAll(req: Request, res: Response){
        try{
            const localidades = await localidadService.getAll();
            res.json(localidades);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener las localidades"
            });
        }
    }
    async getById (req: Request, res: Response){
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
            res.status(500).json({
               message: "Error al obtener la localidad"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: ILocalidad = req.body
            const nuevoLocalidad= await localidadService.create(data);
            res.status(201).json(nuevoLocalidad);
        }catch (error){
        res.status(500).json({
            message:"Error al crear la localidad"
        });
    } 
    }
    async update (req: Request, res:Response){
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
            res.status(500).json({
                message:"Error al Actualizar la localidad"
            });
        }
    }
        async delete (req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            const localidadEliminado = await localidadService.delete(id);
            if (!localidadEliminado){
                return res.status(404).json({
                    message: "Localidad no encontrada"
                });
            }
        }catch (error){
            res.status(500).json ({
                message:"Error al eliminar la localidad"
            });
        }
    }
}
export default new LocalidadController();