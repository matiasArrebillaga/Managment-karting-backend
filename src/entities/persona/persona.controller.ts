import { aNumeros } from "../../utils/validar";
import {Request , Response, NextFunction} from "express";
import personaService from "./persona.service";
import { CreatePersona } from "./persona.interface";

class PersonaController{
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const personas = await personaService.getAll();
            res.json(personas);
        }catch (error){
            next(error);
        }
    }
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: CreatePersona = aNumeros(req.body, "Localidades_idLocalidades");
            const nuevoPersona= await personaService.create(data);
            res.status(201).json(nuevoPersona);
        }catch (error){
            next(error);
        }
    }

    async crearEmpleado(req: Request, res: Response, next: NextFunction) {
    try {
        const persona = await personaService.crearEmpleado(aNumeros(req.body, "Localidades_idLocalidades"));

        res.status(201).json(persona);
    } catch (error) {
        next(error);
    }
}

     async asignarRol (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const { nombreRol } = req.body
            const personaActualizado = await personaService.asignarRol(id, nombreRol)
            res.status(200).json(personaActualizado)
        }catch(error){
            next(error);
        }
    }
    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const personaActualizado = await personaService.update(id, aNumeros(req.body, "Localidades_idLocalidades"))
            res.status(200).json(personaActualizado)
        }catch(error){
            next(error);
        }
    }
        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            await personaService.delete(id);
            res.status(200).json({
                message: "Persona eliminada correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new PersonaController();