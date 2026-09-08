import {Request, Response} from "express";
import authService from "./auth.service";

class AuthController {
    async register (req:Request , res: Response){
        try{
            const nuevaPersona= await authService.register(req.body);
            res.status(201).json(nuevaPersona);
        }catch (error:any){
            res.status(400).json({
                message: error.message || "Error al registrar el usuario"
            });
        }
    }

    async login (req: Request, res: Response){
        try{
            const resultado = await authService.login(req.body);
            res.status(200).json(resultado);
        }catch (error:any){
            res.status(401).json({
                message: error.message || "Error al iniciar sesion"
            });
        }
    }
}

export default new AuthController();