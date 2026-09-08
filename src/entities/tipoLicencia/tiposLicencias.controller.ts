import {Request , Response} from "express";
import { ITiposLicencias } from "./tiposLicencias.interface";
import tiposLicenciasService from "./tiposLicencias.service";

class TiposLicenciasController{
    async getAll(req: Request, res: Response){
        try{
            const tiposLicencias = await tiposLicenciasService.getAll();
            res.json(tiposLicencias);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener los tipos de licencias"
            });
        }
    }
    async getById (req: Request, res: Response){
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
            res.status(500).json({
               message: "Error al obtener los tipos de licencias"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: ITiposLicencias = req.body
            const nuevoTiposLicencias= await tiposLicenciasService.create(data);
            res.status(201).json(nuevoTiposLicencias);
        }catch (error){
        res.status(500).json({
            message:"Error al crear los tipos de licencias"
        });
    } 
    }
    async update (req: Request, res:Response){
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
            res.status(500).json({
                message:"Error al actualizar los tipos de licencias"
            });
        }
    }
        async delete (req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            const tiposLicenciasEliminado = await tiposLicenciasService.delete(id);
            if (!tiposLicenciasEliminado){
                return res.status(404).json({
                    message: "Tipos de licencias no encontrado"
                });
            }
        }catch (error){
            res.status(500).json ({
                message:"Error al eliminar los tipos de licencias"
            });
        }
    }
}
export default new TiposLicenciasController();