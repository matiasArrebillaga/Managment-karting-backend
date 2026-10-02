import {prisma} from "../../config/prisma"
import { CreateLocalidad, ILocalidad, UpdateLocalidad } from "./localidad.interface";

// SERVICE DE LOCALIDAD
// es llamado desde el controllador
// flujo completo: APP -> localidad.routes -> localidad.controller(localidad.interface) -> localidad.service
class LocalidadService {
    // primero estan las funciones privadas que validan los datos que despues se van a usar
    private validarId(id: number) {
        if (!Number.isInteger(id)) { // valida que el id sea integer (es para proteccion, no tendria que ser necesario)
            throw new Error("El identificador debe ser un número entero");
        }
    }
    // validacion de que se ingresa un texto valido
    // valida que sea un string, que cuando se saque los espacios no sea 0 la longitud y que tenga menos de 45 caracteres
    private validarDatos(data: CreateLocalidad | UpdateLocalidad) {
        if (data.nombre !== undefined && (typeof data.nombre !== "string" || data.nombre.trim().length === 0 || data.nombre.trim().length > 45)) {
            throw new Error("El nombre debe ser un texto de entre 1 y 45 caracteres");
        }
    }
    // funcion simple 
    async getAll(){
        return await prisma.localidades.findMany(); // llama a prisma para que haga la query
    }

    async getById(idLocalidades:number){
        this.validarId(idLocalidades);
        return await prisma.localidades.findUnique({
            where: {idLocalidades}// busqueda por ID de prisma
        });
    }
    async create(data:CreateLocalidad){
        this.validarDatos(data);
        return await prisma.localidades.create({
            data: { nombre: data.nombre.trim() } // elimina los espacios
        })
    }
    // recibe el id y la interface de update
    async update(idLocalidades:number,data:UpdateLocalidad){
        this.validarId(idLocalidades);// llama a la validacion privada de id 
        this.validarDatos(data);// y del string
        return await prisma.localidades.update({
            where: {idLocalidades},
            data: data.nombre === undefined ? data : { nombre: data.nombre.trim() }
        });
    }
    async delete(idLocalidades:number){
        this.validarId(idLocalidades);
        return await prisma.localidades.delete({
            where:{idLocalidades}
        });
    }
}
export default new LocalidadService();