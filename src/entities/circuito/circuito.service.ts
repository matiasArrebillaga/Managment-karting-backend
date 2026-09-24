import { prisma } from "../../config/prisma";
import { CreateCircuito, ICircuito, UpdateCircuito } from "./circuto.interface";

class CircuitoService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) {
            throw new Error("El identificador debe ser un número entero");
        }
    }

    private validarDatos(data: CreateCircuito | UpdateCircuito){
        if (data.distancia !== undefined && (!Number.isInteger(data.distancia)|| data.distancia <= 0)){
            throw new Error ("La distancia debe ser un numero mayor que cero");
        }
        if (data.dificultad !== undefined && (typeof data.dificultad !== "string"||data.dificultad.trim().length === 0 || data.dificultad.trim().length > 45)){
            throw new Error ("La dificultad debe ser un texto entre 1 y 45 caracteres")
        }
        if (data.maximo !== undefined && (!Number.isInteger(data.maximo) || data.maximo <= 0)) {
            throw new Error("El máximo debe ser un número entero mayor que cero");
        }
    }
    async getAll(){
        return await prisma.circuitos.findMany();
    }
    async getById(idCircuitos:number){
        this.validarId(idCircuitos);
        return await prisma.circuitos.findUnique({
            where: {idCircuitos}
        });
    }
    async create(data:CreateCircuito){
        this.validarDatos(data);
        return await prisma.circuitos.create({
            data: {...data, dificultad: data.dificultad.trim()}
        })
    }
    async update(idCircuitos:number,data:UpdateCircuito){
        this.validarId(idCircuitos);
        this.validarDatos(data);
        return await prisma.circuitos.update({
            where: {idCircuitos},
            data: data.dificultad === undefined ? data : {...data, dificultad: data.dificultad.trim()}
        });
    }
    async delete(idCircuitos:number){
        this.validarId(idCircuitos);
        return await prisma.circuitos.delete({
            where:{idCircuitos}
        });
    }
}
export default new CircuitoService();