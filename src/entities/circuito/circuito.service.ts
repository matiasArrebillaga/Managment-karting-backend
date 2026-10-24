import { AppError } from "../../middleware/error.middleware";
import { prisma } from "../../config/prisma";
import { CreateCircuito, ICircuito, UpdateCircuito } from "./circuto.interface";

class CircuitoService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) {
            throw new AppError("El identificador debe ser un número entero");
        }
    }

    private validarDatos(data: CreateCircuito | UpdateCircuito){
        if (data.distancia !== undefined && (!Number.isInteger(data.distancia)|| data.distancia <= 0)){
            throw new AppError("La distancia debe ser un numero mayor que cero");
        }
        if (data.dificultad !== undefined && (typeof data.dificultad !== "string"||data.dificultad.trim().length === 0 || data.dificultad.trim().length > 45)){
            throw new AppError("La dificultad debe ser un texto entre 1 y 45 caracteres")
        }
        if (data.maximo !== undefined && (!Number.isInteger(data.maximo) || data.maximo <= 0)) {
            throw new AppError("El máximo debe ser un número entero mayor que cero");
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

   async create(data: CreateCircuito) {
    const datos = {
    distancia: data.distancia,
    dificultad: data.dificultad.trim(),
    maximo: data.maximo
    };
    this.validarDatos(datos);
    return await prisma.circuitos.create({
    data: datos

});

}

    async update(idCircuitos: number, data: UpdateCircuito) {
  this.validarId(idCircuitos);
  this.validarDatos(data);

  const datos = {
    ...(data.distancia !== undefined && {
      distancia: data.distancia
    }),
    ...(data.dificultad !== undefined && {
      dificultad: data.dificultad.trim()
    }),
    ...(data.maximo !== undefined && {
      maximo: data.maximo
    })
  };

  return await prisma.circuitos.update({
    where: { idCircuitos },
    data: datos
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