import {prisma} from "../../config/prisma"
import { CreateTiposLicencias, ITiposLicencias, UpdateTiposLicencias } from "./tiposLicencias.interface"

class TiposLicenciasService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private validarDatos(data: CreateTiposLicencias | UpdateTiposLicencias) {
        for (const campo of ["nombre", "descripcion"] as const) {
            const valor = data[campo];
            if (valor !== undefined && (typeof valor !== "string" || valor.trim().length === 0 || valor.trim().length > 45)) {
                throw new Error(`El campo ${campo} debe ser un texto de entre 1 y 45 caracteres`);
            }
        }
        if (data.nivel !== undefined && (!Number.isInteger(data.nivel) || data.nivel <= 0)) {
            throw new Error("El nivel debe ser un número entero positivo");
        }
    }
    async getAll(){
        return await prisma.tiposlicencias.findMany();
    }
    async getById(idTipoLicencias:number){
        this.validarId(idTipoLicencias);
        return await prisma.tiposlicencias.findUnique({
            where: {idTipoLicencia : idTipoLicencias}
        });
    }
    async create(data:CreateTiposLicencias){
        this.validarDatos(data);
        return await prisma.tiposlicencias.create({
            data: { ...data, nombre: data.nombre.trim(), descripcion: data.descripcion.trim() }
        })
    }
    async update(idTipoLicencias:number,data:UpdateTiposLicencias){
        this.validarId(idTipoLicencias);
        this.validarDatos(data);
        return await prisma.tiposlicencias.update({
            where: {idTipoLicencia : idTipoLicencias},
            data: {
                ...data,
                ...(data.nombre === undefined ? {} : { nombre: data.nombre.trim() }),
                ...(data.descripcion === undefined ? {} : { descripcion: data.descripcion.trim() })
            }
        });
    }
    async delete(idTipoLicencias:number){
        this.validarId(idTipoLicencias);
        return await prisma.tiposlicencias.delete({
            where:{idTipoLicencia : idTipoLicencias}
        });
    }
}
export default new TiposLicenciasService();