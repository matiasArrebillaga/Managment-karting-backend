import { type CreateLicencia, type UpdateLicencia } from "./licencia.interface";
import { prisma } from "../../config/prisma";

class LicenciaService {

    async getAll() {
        return await prisma.licencias.findMany();
    }

    async getById(idLicencias: number) {
        return await prisma.licencias.findUnique({
            where: { idLicencias }
        });
    }

    
    async create(data: CreateLicencia) {

        // Validar que exista la persona
        const persona = await prisma.personas.findUnique({
            where: {
                idPersona: data.Personas_idPersona
            }
        });

        if (!persona) {
            throw new Error("La persona ingresada no existe");
        }

        // Validar que exista el tipo de licencia
        const tipoLicencia = await prisma.tiposlicencias.findUnique({
            where: {
                idTipoLicencia: data.TiposLicencias_idTipoLicencia
            }
        });

        if (!tipoLicencia) {
            throw new Error("El tipo de licencia ingresado no existe");
        }

        return await prisma.licencias.create({
            data
        });
    }



    async update(idLicencias: number, data: UpdateLicencia) {
        return await prisma.licencias.update({
            where: { idLicencias },
            data
        });
    }

    async delete(idLicencias: number) {
        return await prisma.licencias.delete({
            where: { idLicencias }
        });
    }
}

export default new LicenciaService();