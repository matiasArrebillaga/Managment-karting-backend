import {type CreateLicencia , type UpdateLicencia } from "./licencia.interface";
import {prisma} from "../../config/prisma"


class LicenciaService {
    async getAll(){
        return await prisma.licencias.findMany();
    }
    async getById(idLicencias:number){
        return await prisma.licencias.findUnique({
            where: {idLicencias}
        });
    }
    async create(data:CreateLicencia){
        return await prisma.licencias.create({
            data
        })
    }
    async update(idLicencias:number,data:UpdateLicencia){
        return await prisma.licencias.update({
            where: {idLicencias},
            data
        });
    }
    async delete(idLicencias:number){
        return await prisma.licencias.delete({
            where:{idLicencias}
        });
    }
}
export default new LicenciaService();
