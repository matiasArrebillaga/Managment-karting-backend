import {prisma} from "../../config/prisma"
import { IPersona, UpdatePersona } from "./persona.interface"

class PersonaService {
    async getAll(){
        return await prisma.personas.findMany();
        omit: {contraseña:true}
    }
    async getById(idPersona:number){
        return await prisma.personas.findUnique({
            where: {idPersona},
            omit: {contraseña: true}
        });
    }
    async create(data:any){
        return await prisma.personas.create({
            data
        })
    }
    async update(idPersona:number,data:UpdatePersona){
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
export default new PersonaService();