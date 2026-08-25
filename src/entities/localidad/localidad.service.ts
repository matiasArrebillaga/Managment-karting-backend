import {prisma} from "../../config/prisma"
import { ILocalidad } from "./localidad.interface";
class LocalidadService {
    async getAll(){
        return await prisma.localidades.findMany();
    }
    async getById(idLocalidades:number){
        return await prisma.localidades.findUnique({
            where: {idLocalidades}
        });
    }
    async create(data:any){
        return await prisma.localidades.create({
            data
        })
    }
    async update(idLocalidades:number,data:Partial<ILocalidad>){
        return await prisma.localidades.update({
            where: {idLocalidades},
            data
        });
    }
    async delete(idLocalidades:number){
        return await prisma.localidades.delete({
            where:{idLocalidades}
        });
    }
}
export default new LocalidadService();