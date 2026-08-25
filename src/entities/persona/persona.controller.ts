import {Request , Response} from "express";
import personaService from "./persona.service";
import { IPersona } from "./persona.interface";

class PersonaController{
    async getAll(req: Request, res: Response){
        try{
            const personas = await personaService.getAll();
            res.json(personas);
        }catch (error){
            res.status(500).json({
                message: "Error al obtener las personas"
            });
        }
    }
    async getById (req: Request, res: Response){
        try{
            const id = Number(req.params.id)
            const persona = await personaService.getById(id);
            if (!persona){
                return res.status(404).json({
                    message: "Persona no encontrado"
                });
            }
            res.json(persona);
        }catch(error){
            res.status(500).json({
               message: "Error al obtener la persona"
            });
        }
    }
    async create (req: Request, res: Response){
        try {
            const data: IPersona = req.body
            const nuevoPersona= await personaService.create(data);
            res.status(201).json(nuevoPersona);
        }catch (error){
        res.status(500).json({
            message:"Error al crear la persona"
        });
    } 
    }
    async update (req: Request, res:Response){
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
            res.status(500).json({
                message:"Error al actualizar la persona"
            });
        }
    }
        async delete (req: Request, res: Response){
        try {
            const id = Number(req.params.id);
            const personaEliminado = await personaService.delete(id);
            if (!personaEliminado){
                return res.status(404).json({
                    message: "Persona no encontrado"
                });
            }
        }catch (error){
            res.status(500).json ({
                message:"Error al eliminar la persona"
            });
        }
    }
}
export default new PersonaController();