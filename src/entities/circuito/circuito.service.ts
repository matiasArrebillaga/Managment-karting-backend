import { prisma } from "../../config/prisma";
import { CreateCircuito, ICircuito, UpdateCircuito } from "./circuto.interface";

class CircuitoService {
    async getAll(){
        return await prisma.circuitos.findMany();
    }
    async getById(idCircuitos:number){
        return await prisma.circuitos.findUnique({
            where: {idCircuitos}
        });
    }
    async create(data:CreateCircuito){
        return await prisma.circuitos.create({
            data
        })
    }
    async update(idCircuitos:number,data:UpdateCircuito){
        return await prisma.circuitos.update({
            where: {idCircuitos},
            data
        });
    }
    async delete(idCircuitos:number){
        return await prisma.circuitos.delete({
            where:{idCircuitos}
        });
    }
}
export default new CircuitoService();