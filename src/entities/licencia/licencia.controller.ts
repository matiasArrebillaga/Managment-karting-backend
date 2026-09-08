import LicenciaService from "./licencia.service";
import {Request , Response} from "express";
import {ILicencia} from "./licencia.interface"


class LicenciaController{
    async getAll(req: Request, res: Response){
        try{
            const licencias  = await LicenciaService.getAll();
            res.json(licencias);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener las licencias"
            });
        }
    }
    async getById (req: Request, res: Response){
        try{
            const id = Number(req.params.id)
            const licencia= await LicenciaService.getById(id);
            if (!licencia){
                return res.status(404).json({
                    message: "Licencia no encontrada"
                });
            }
            res.json(licencia);
        }catch(error){
            res.status(500).json({
               message: "Error al obtener la licencia"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: ILicencia  = req.body
            const nuevaLicencia= await LicenciaService.create(data);
            res.status(201).json(nuevaLicencia);
        }catch (error){
        res.status(500).json({
            message:"Error al crear la licencia"
        });
    } 
    }
    async update (req: Request, res:Response){
        try{
            const id = Number(req.params.id)
            const licenciaActualizada = await LicenciaService.update(id,req.body)
            if (!licenciaActualizada){
                return res.status(404).json({
                    message: "Licencia no encontrada"
                })
            }
            res.status(200).json(licenciaActualizada)
        }catch(error){
            res.status(500).json({
                message:"Error al Actualizar la licencia"
            });
        }
    }
        async delete (req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            const licenciaEliminada = await LicenciaService.delete(id);
            if (!licenciaEliminada){
                return res.status(404).json({
                    message: "Licencia no encontrada"
                });
            }
        }catch (error){
            res.status(500).json ({
                message:"Error al eliminar la licencia"
            });
        }
    }
}
export default new LicenciaController();