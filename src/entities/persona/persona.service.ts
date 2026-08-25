import {prisma} from "../../config/prisma"
import { IPersona } from "./persona.interface"

class PersonaService {
    async getAll(){
        return await prisma.personas.findMany();
    }
    async getById(idPersona:number){
        return await prisma.personas.findUnique({
            where: {idPersona}
        });
    }
    async create(data:any){
        return await prisma.personas.create({
            data
        })
    }
    async update(idPersona:number,data:Partial<IPersona>){
        return await prisma.personas.update({
            where: {idPersona},
            data
        });
    }
    async delete(idPersona:number){
        return await prisma.personas.delete({
            where:{idPersona}
        });
    }
}