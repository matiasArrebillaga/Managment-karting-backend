import {prisma} from "../../config/prisma"

import { CreateTiposKartings, ITiposKartings, UpdateTiposKartings } from "./tiposKarting.interface"

class TiposKartingsService {
    async getAll(){
        return await prisma.tiposkarting.findMany();
    }
    async getById(idTipoKarting:number){
        return await prisma.tiposkarting.findUnique({
            where: {idTiposKarting : idTipoKarting}
        });
    }
    async create(data:CreateTiposKartings){
        return await prisma.tiposkarting.create({
            data
        })
    }
    async update(idTipoKarting:number,data:UpdateTiposKartings){
        return await prisma.tiposkarting.update({
            where: {idTiposKarting : idTipoKarting},
            data
        });
    }
    async delete(idTipoKarting:number){
        return await prisma.tiposkarting.delete({
            where:{idTiposKarting : idTipoKarting}
        });
    }
}
export default new TiposKartingsService();