import LicenciaService from "./licencia.service";
import {Request , Response, NextFunction} from "express";
import {ILicencia} from "./licencia.interface"


class LicenciaController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const licencias  = await LicenciaService.getAll();
            res.json(licencias);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
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
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: ILicencia  = req.body
            const nuevaLicencia= await LicenciaService.create(data);
            res.status(201).json(nuevaLicencia);
        }catch (error){
            next(error);
        }
    }
    async update (req: Request, res:Response, next: NextFunction){
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
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const licenciaEliminada = await LicenciaService.delete(id);
            if (!licenciaEliminada){
                return res.status(404).json({
                    message: "Licencia no encontrada"
                });
            }
            res.status(200).json({
                message: "Licencia eliminada correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new LicenciaController();