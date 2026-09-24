import {prisma} from "../../config/prisma"

import { CreateTiposKartings, ITiposKartings, UpdateTiposKartings } from "./tiposKarting.interface"

class TiposKartingsService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private validarDatos(data: CreateTiposKartings | UpdateTiposKartings) {
        for (const campo of ["nombre", "descripcion"] as const) {
            const valor = data[campo];
            if (valor !== undefined && (typeof valor !== "string" || valor.trim().length === 0 || valor.trim().length > 45)) {
                throw new Error(`El campo ${campo} debe ser un texto de entre 1 y 45 caracteres`);
            }
        }
        if (data.TiposLicencias_idTipoLicenciaMinima !== undefined &&
            !Number.isInteger(data.TiposLicencias_idTipoLicenciaMinima)) {
            throw new Error("La licencia mínima debe ser un identificador entero");
        }
    }
    async getAll(){
        return await prisma.tiposkarting.findMany();
    }
    async getById(idTipoKarting:number){
        this.validarId(idTipoKarting);
        return await prisma.tiposkarting.findUnique({
            where: {idTiposKarting : idTipoKarting}
        });
    }
    async create(data:CreateTiposKartings){
        this.validarDatos(data);
        const licencia = await prisma.tiposlicencias.findUnique({
            where: { idTipoLicencia: data.TiposLicencias_idTipoLicenciaMinima }
        });
        if (!licencia) {
            throw new Error("La licencia mínima ingresada no existe");
        }
        return await prisma.tiposkarting.create({
            data: { ...data, nombre: data.nombre.trim(), descripcion: data.descripcion.trim() }
        })
    }
    async update(idTipoKarting:number,data:UpdateTiposKartings){
        this.validarId(idTipoKarting);
        this.validarDatos(data);
        if (data.TiposLicencias_idTipoLicenciaMinima !== undefined) {
            const licencia = await prisma.tiposlicencias.findUnique({
                where: { idTipoLicencia: data.TiposLicencias_idTipoLicenciaMinima }
            });
            if (!licencia) {
                throw new Error("La licencia mínima ingresada no existe");
            }
        }
        return await prisma.tiposkarting.update({
            where: {idTiposKarting : idTipoKarting},
            data: {
                ...data,
                ...(data.nombre === undefined ? {} : { nombre: data.nombre.trim() }),
                ...(data.descripcion === undefined ? {} : { descripcion: data.descripcion.trim() })
            }
        });
    }
    async delete(idTipoKarting:number){
        this.validarId(idTipoKarting);
        return await prisma.tiposkarting.delete({
            where:{idTiposKarting : idTipoKarting}
        });
    }
}
export default new TiposKartingsService();