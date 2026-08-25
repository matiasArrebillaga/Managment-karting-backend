import { prisma } from "../../config/prisma";
import { IKarting } from "./karting.interface";

class KartingService {
    async getAll(){
        return await prisma.kartings.findMany();
    }
    async getById(idKartings:number){
        return await prisma.kartings.findUnique({
            where: {idKartings}
        });
    }
    async create(data:any){
        return await prisma.kartings.create({
            data
        })
    }
    async update(idKartings:number,data:IKarting){
        return await prisma.kartings.update({
            where: {idKartings},
            data:data
        });
    }
    async delete(idKartings:number){
        return await prisma.kartings.delete({
            where:{idKartings}
        });
    }
}
export default new KartingService();