import {prisma} from "../../config/prisma"
import { CreateLocalidad, ILocalidad, UpdateLocalidad } from "./localidad.interface";
class LocalidadService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) {
            throw new Error("El identificador debe ser un número entero");
        }
    }

    private validarDatos(data: CreateLocalidad | UpdateLocalidad) {
        if (data.nombre !== undefined && (typeof data.nombre !== "string" || data.nombre.trim().length === 0 || data.nombre.trim().length > 45)) {
            throw new Error("El nombre debe ser un texto de entre 1 y 45 caracteres");
        }
    }
    async getAll(){
        return await prisma.localidades.findMany();
    }
    async getById(idLocalidades:number){
        this.validarId(idLocalidades);
        return await prisma.localidades.findUnique({
            where: {idLocalidades}
        });
    }
    async create(data:CreateLocalidad){
        this.validarDatos(data);
        return await prisma.localidades.create({
            data: { nombre: data.nombre.trim() }
        })
    }
    async update(idLocalidades:number,data:UpdateLocalidad){
        this.validarId(idLocalidades);
        this.validarDatos(data);
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