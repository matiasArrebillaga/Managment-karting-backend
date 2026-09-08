import { prisma } from "../../config/prisma";
import { IRol } from "./rol.interface";

class RolService {
    async getAll(){
        return await prisma.roles.findMany();
    }
    async getById(idRol:number){
        return await prisma.roles.findUnique({
            where: {idRol}
        });
    }
    async create(data:any){
        return await prisma.roles.create({
            data
        })
    }
    async update(idRol:number,data:Partial<IRol>){
        return await prisma.roles.update({
            where: {idRol},
            data
        });
    }
    async delete(idRol:number){
        return await prisma.roles.delete({
            where:{idRol}
        });
    }
}
export default new RolService();