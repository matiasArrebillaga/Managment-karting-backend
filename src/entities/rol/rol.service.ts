import { validarId } from "../../utils/validar";
import { prisma } from "../../config/prisma";

class RolService {

    async getAll(){
        return await prisma.roles.findMany();
    }
    async getById(idRol:number){
        validarId(idRol);
        return await prisma.roles.findUnique({
            where: {idRol}
        });
    }
}
export default new RolService();