import { prisma } from "../../config/prisma";
import { IRol } from "./rol.interface";

class RolService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private validarDatos(data: Partial<IRol>) {
        if (data.nombre !== undefined && (typeof data.nombre !== "string" || data.nombre.trim().length === 0 || data.nombre.trim().length > 20)) {
            throw new Error("El nombre debe ser un texto de entre 1 y 20 caracteres");
        }
    }
    async getAll(){
        return await prisma.roles.findMany();
    }
    async getById(idRol:number){
        this.validarId(idRol);
        return await prisma.roles.findUnique({
            where: {idRol}
        });
    }
    async create(data: Omit<IRol, "idRol">){
        this.validarDatos(data);
        const existente = await prisma.roles.findFirst({ where: { nombre: data.nombre.trim() } });
        if (existente) {
            throw new Error("Ya existe un rol con ese nombre");
        }
        return await prisma.roles.create({
            data: { nombre: data.nombre.trim() }
        })
    }
    async update(idRol:number,data:Partial<IRol>){
        this.validarId(idRol);
        this.validarDatos(data);
        if (data.nombre !== undefined) {
            const existente = await prisma.roles.findFirst({
                where: { nombre: data.nombre.trim(), NOT: { idRol } }
            });
            if (existente) {
                throw new Error("Ya existe un rol con ese nombre");
            }
        }
        return await prisma.roles.update({
            where: {idRol},
            data: data.nombre === undefined ? data : { nombre: data.nombre.trim() }
        });
    }
    async delete(idRol:number){
        this.validarId(idRol);
        return await prisma.roles.delete({
            where:{idRol}
        });
    }
}
export default new RolService();