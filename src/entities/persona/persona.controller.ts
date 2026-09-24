import {Request , Response, NextFunction} from "express";
import personaService from "./persona.service";
import { CreatePersona, IPersona } from "./persona.interface";

class PersonaController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const personas = await personaService.getAll();
            res.json(personas);
        }catch (error){
            next(error);
        }
    }
    async getById (req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const persona : IPersona | null = await personaService.getById(id);
            if (!persona){
                return res.status(404).json({
                    message: "Persona no encontrado"
                });
            }
            res.json(persona);
        }catch(error){
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: CreatePersona = req.body
            const nuevoPersona= await personaService.create(data);
            res.status(201).json(nuevoPersona);
        }catch (error){
            next(error);
        }
    }
    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const personaActualizado = await personaService.update(id,req.body)
            if (!personaActualizado){
                return res.status(404).json({
                    message: "Persona no encontrada"
                })
            }
            res.status(200).json(personaActualizado)
        }catch(error){
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const personaEliminado = await personaService.delete(id);
            if (!personaEliminado){
                return res.status(404).json({
                    message: "Persona no encontrado"
                });
            }
            res.status(200).json({
                message: "Persona eliminada correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new PersonaController();