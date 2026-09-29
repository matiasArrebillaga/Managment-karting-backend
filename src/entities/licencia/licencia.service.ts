import { type CreateLicencia, type UpdateLicencia } from "./licencia.interface";
import { prisma } from "../../config/prisma";

class LicenciaService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarDatos(data: CreateLicencia | UpdateLicencia) {
        for (const campo of ["Personas_idPersona", "TiposLicencias_idTipoLicencia"] as const) {
            if (data[campo] !== undefined && !Number.isInteger(data[campo])) throw new Error(`El campo ${campo} debe ser un identificador entero`);
        }
        const emision = data.fechaEmision === undefined ? undefined : new Date(data.fechaEmision);
        const vencimiento = data.fechaVencimiento === undefined ? undefined : new Date(data.fechaVencimiento);
        if (emision && Number.isNaN(emision.getTime())) throw new Error("La fecha de emisión no es válida");
        if (vencimiento && Number.isNaN(vencimiento.getTime())) throw new Error("La fecha de vencimiento no es válida");
        if (emision && emision > new Date()) throw new Error("La fecha de emisión no puede ser futura");
        if (emision && vencimiento && vencimiento <= emision) throw new Error("El vencimiento debe ser posterior a la emisión");
    }

    async getAll() {
        return await prisma.licencias.findMany();
    }

    async getById(idLicencias: number) {
        this.validarId(idLicencias);
        return await prisma.licencias.findUnique({
            where: { idLicencias }
        });
    }

    
    async create(data: CreateLicencia) {
        this.validarDatos(data);

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
            data: {...data, fechaEmision: new Date(data.fechaEmision), fechaVencimiento: new Date(data.fechaVencimiento)}
        });
    }



    async update(idLicencias: number, data: UpdateLicencia) {
        this.validarId(idLicencias);
        this.validarDatos(data);
        const actual = await prisma.licencias.findUnique({where: {idLicencias}});
        if (!actual) throw new Error("La licencia ingresada no existe");
        if (data.Personas_idPersona !== undefined &&
            !await prisma.personas.findUnique({where: {idPersona: data.Personas_idPersona}})) {
            throw new Error("La persona ingresada no existe");
        }
        if (data.TiposLicencias_idTipoLicencia !== undefined &&
            !await prisma.tiposlicencias.findUnique({where: {idTipoLicencia: data.TiposLicencias_idTipoLicencia}})) {
            throw new Error("El tipo de licencia ingresado no existe");
        }
        const emision = data.fechaEmision === undefined ? actual.fechaEmision : new Date(data.fechaEmision);
        const vencimiento = data.fechaVencimiento === undefined ? actual.fechaVencimiento : new Date(data.fechaVencimiento);
        this.validarDatos({fechaEmision: emision.toISOString(), fechaVencimiento: vencimiento.toISOString()});
        return await prisma.licencias.update({
            where: { idLicencias },
            data: {...data, ...(data.fechaEmision === undefined ? {} : {fechaEmision: emision}), ...(data.fechaVencimiento === undefined ? {} : {fechaVencimiento: vencimiento})}
        });
    }

    async delete(idLicencias: number) {
        this.validarId(idLicencias);
        return await prisma.licencias.delete({
            where: { idLicencias }
        });
    }
}

export default new LicenciaService();