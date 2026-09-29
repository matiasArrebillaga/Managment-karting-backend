import {Request, Response, NextFunction} from "express";
import authService from "./auth.service";

class AuthController {
    async register (req:Request , res: Response, next: NextFunction){
        try{
            const nuevaPersona= await authService.register(req.body);
            res.status(201).json(nuevaPersona);
        }catch (error:any){
            next(error);
        }
    }

    async login (req: Request, res: Response, next: NextFunction){
        try{
            const resultado = await authService.login(req.body);
            res.status(200).json(resultado);
        }catch (error:any){
            next(error);
        }
    }
}

export default new AuthController();