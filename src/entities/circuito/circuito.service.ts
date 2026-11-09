import { validarId } from "../../utils/validar";
import { AppError } from "../../middleware/error.middleware";
import { prisma } from "../../config/prisma";
import { CreateCircuito, ICircuito, UpdateCircuito } from "./circuito.interface";
import { Prisma } from "../../generated/prisma/client";
import { hoyUTC } from "../../utils/fecha";
import { opcionesTxBloqueo } from "../../utils/ocupacion";

type Franja = { fecha: Date; horaInicio: Date; horaFin: Date };

// pico de karts en pista al mismo tiempo en un dia
// a la misma hora primero sale uno y despues entra otro, asi 10-11 y 11-12 no se pisan
function picoDelDia(franjas: Franja[]) {
    const eventos = franjas.flatMap(f => [[f.horaInicio.getTime(), 1], [f.horaFin.getTime(), -1]]);
    eventos.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let enPista = 0;
    let pico = 0;
    for (const [, cambio] of eventos) {
        enPista += cambio;
        pico = Math.max(pico, enPista);
    }
    return pico;
}

class CircuitoService {

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
    // el nuevo maximo tiene que cubrir torneos y reservas de hoy en adelante
    private async validarNuevoMaximo(db: Prisma.TransactionClient, idCircuitos: number, maximo: number) {
        const { _max } = await db.torneos.aggregate({
            where: { carreras: { some: { Circuitos_idCircuitos: idCircuitos } } },
            _max: { cupoMaximo: true }
        });
        if (_max.cupoMaximo !== null && _max.cupoMaximo > maximo) {
            throw new AppError(`El máximo no puede ser menor que ${_max.cupoMaximo}: hay un torneo con ese cupo que corre en este circuito`);
        }

        const hoy = hoyUTC();
        const [reservas, kartsEnCarreras] = await Promise.all([
            db.reservas.findMany({
                where: { Circuitos_idCircuitos: idCircuitos, fechaReserva: { gte: hoy } },
                select: { fechaReserva: true, horaInicio: true, horaFin: true }
            }),
            // una fila por kart de cada carrera
            db.carreras_kartings.findMany({
                where: { Carrera_Circuitos_idCircuitos: idCircuitos, Carrera_fecha: { gte: hoy } },
                select: { Carrera_fecha: true, carreras: { select: { horaInicio: true, horaFin: true } } }
            })
        ]);
        const franjas: Franja[] = [
            ...reservas.map(r => ({ fecha: r.fechaReserva, horaInicio: r.horaInicio, horaFin: r.horaFin })),
            ...kartsEnCarreras.map(k => ({ fecha: k.Carrera_fecha, ...k.carreras }))
        ];
        const porDia = new Map<string, Franja[]>();
        for (const f of franjas) {
            const dia = f.fecha.toISOString().slice(0, 10);
            porDia.set(dia, [...(porDia.get(dia) ?? []), f]);
        }
        for (const [dia, delDia] of porDia) {
            const pico = picoDelDia(delDia);
            if (pico > maximo) {
                throw new AppError(`El máximo no puede ser menor que ${pico}: el ${dia} ya hay ${pico} kartings en pista al mismo tiempo`);
            }
        }
    }

    async getAll(){
        return await prisma.circuitos.findMany();
    }
    async getById(idCircuitos:number){
        validarId(idCircuitos);
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
  validarId(idCircuitos);
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

  if (datos.maximo === undefined) {
    return await prisma.circuitos.update({ where: { idCircuitos }, data: datos });
  }
  const maximo = datos.maximo;
  return await prisma.$transaction(async (db) => {
    // bloquea el circuito hasta el commit asi nadie valida contra el maximo viejo
    const circuito = await db.$queryRaw<unknown[]>`SELECT idCircuitos FROM circuitos WHERE idCircuitos = ${idCircuitos} FOR UPDATE`;
    if (circuito.length === 0) throw new AppError("El circuito indicado no existe", 404);
    await this.validarNuevoMaximo(db, idCircuitos, maximo);
    return await db.circuitos.update({ where: { idCircuitos }, data: datos });
  }, opcionesTxBloqueo);
}
    async delete(idCircuitos:number){
        validarId(idCircuitos);
        return await prisma.circuitos.delete({
            where:{idCircuitos}
        });
    }
}
export default new CircuitoService();