import { prisma } from "../../config/prisma";

export class KartingService {
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
    async update(idKartings:number,data:any){
        return await prisma.kartings.update({
            where: {idKartings},
            data
        });
    }
    async delete(idKartings:number){
        return await prisma.kartings.delete({
            where:{idKartings}
        });
    }
}
