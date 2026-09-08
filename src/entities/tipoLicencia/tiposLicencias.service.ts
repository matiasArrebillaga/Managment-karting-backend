import {prisma} from "../../config/prisma"
import { CreateTiposLicencias, ITiposLicencias, UpdateTiposLicencias } from "./tiposLicencias.interface"

class TiposLicenciasService {
    async getAll(){
        return await prisma.tiposlicencias.findMany();
    }
    async getById(idTipoLicencias:number){
        return await prisma.tiposlicencias.findUnique({
            where: {idTipoLicencia : idTipoLicencias}
        });
    }
    async create(data:CreateTiposLicencias){
        return await prisma.tiposlicencias.create({
            data
        })
    }
    async update(idTipoLicencias:number,data:UpdateTiposLicencias){
        return await prisma.tiposlicencias.update({
            where: {idTipoLicencia : idTipoLicencias},
            data
        });
    }
    async delete(idTipoLicencias:number){
        return await prisma.tiposlicencias.delete({
            where:{idTipoLicencia : idTipoLicencias}
        });
    }
}
export default new TiposLicenciasService();