import {Request , Response, NextFunction} from "express";
import localidadService from "./localidad.service";
import { CreateLocalidad, ILocalidad } from "./localidad.interface";

// el controlador recibe la request desde la ruta y por cada metodo llama al service correspondiente
class LocalidadController{
// viene de GET api/localidades 
// recibe el objeto req y res de express y next que llama al middleware
    async getAll(req: Request, res: Response, next: NextFunction){
        try{
            const localidades = await localidadService.getAll(); // llama al service 
            res.json(localidades); // envia un json con todas las localidades 
        }catch (error){ // encuentra un error y llama al middleware para que de el mensaje
            next(error);
        }
    }

// viene de la llamada GET api/localidades/:id
    async getById (req: Request, res: Response, next: NextFunction){
        try{
            const id = Number(req.params.id) // el id ruta
            const localidad= await localidadService.getById(id);// llama al service con el id como parametro
            if (!localidad){
                return res.status(404).json({
                    message: "Localidad no encontrado"
                });
            }
            res.json(localidad);
        }catch(error){
            next(error);
        }
    }
// utiliza POST api/localidades
    async create (req: Request, res: Response, next: NextFunction){
        try {
            const data: CreateLocalidad = req.body  // verifica que el json recibido sea la interface
            const nuevoLocalidad= await localidadService.create(data);// llama al service 
            res.status(201).json(nuevoLocalidad);// envia un codigo correcto y el json de la entidad creada
        }catch (error){
        next(error);
    } 
    }

    async update (req: Request, res:Response, next: NextFunction){
        try{
            const id = Number(req.params.id)
            const localidadActualizado = await localidadService.update(id,req.body)// usa la interface para actualizacion
            if (!localidadActualizado){
                return res.status(404).json({
                    message: "Localidad no encontrada"
                })
            }
            res.status(200).json(localidadActualizado)
        }catch(error){
            next(error);
        }
    }


        async delete (req: Request, res: Response, next: NextFunction){
        try {
            const id = Number(req.params.id);
            const localidadEliminado = await localidadService.delete(id);
            if (!localidadEliminado){
                return res.status(404).json({
                    message: "Localidad no encontrada"
                });
            }
                res.status(200).json({
                message: "Localidad eliminada correctamente"
            });
        }catch (error){
            next(error);
        }
    }
}
export default new LocalidadController();