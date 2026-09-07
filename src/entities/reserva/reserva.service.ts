import {prisma} from "../../config/prisma"
import { UpdateReserva , CreateReserva } from "./reserva.interface"

class ReservaService {
    async getAll(){
        return await prisma.reservas.findMany();
    }
    async getById(idReservas:number){
        return await prisma.reservas.findUnique({
            where: {idReservas}
        });
    }
    async create(data:CreateReserva){
        return await prisma.reservas.create({
            data
        })
    }
    async update(idReservas:number,data:UpdateReserva){
        return await prisma.reservas.update({
            where: {idReservas},
            data
        });
    }
    async delete(idReservas:number){
        return await prisma.reservas.delete({
            where:{idReservas}
        });
    }
}
export default new ReservaService();