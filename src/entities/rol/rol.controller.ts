import {Request , Response, NextFunction} from "express";
import rolService from "./rol.service";

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
}
export default new RolController();