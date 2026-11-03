import { AppError } from "../../middleware/error.middleware";
import {prisma} from "../../config/prisma"
import { opcionesTxBloqueo, validarLicenciaEnCarrerasFuturas } from "../../utils/ocupacion"

import { CreateTiposKartings, ITiposKartings, UpdateTiposKartings } from "./tiposKarting.interface"

class TiposKartingsService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new AppError("El identificador debe ser un número entero");
    }

    private validarDatos(data: CreateTiposKartings | UpdateTiposKartings) {
        for (const campo of ["nombre", "descripcion"] as const) {
            const valor = data[campo];
            if (valor !== undefined && (typeof valor !== "string" || valor.trim().length === 0 || valor.trim().length > 45)) {
                throw new AppError(`El campo ${campo} debe ser un texto de entre 1 y 45 caracteres`);
            }
        }
        if (data.TiposLicencias_idTipoLicenciaMinima !== undefined &&
            !Number.isInteger(data.TiposLicencias_idTipoLicenciaMinima)) {
            throw new AppError("La licencia mínima debe ser un identificador entero");
        }
        // Es la base del monto de las reservas: un cero o un negativo haria que se
        // cobre mal en silencio.
        if (data.precioHora !== undefined &&
            (typeof data.precioHora !== "number" || !Number.isFinite(data.precioHora) || data.precioHora <= 0)) {
            throw new AppError("El precio por hora debe ser un número mayor que cero");
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
    async create(data: CreateTiposKartings) {
    this.validarDatos(data);

    const licencia = await prisma.tiposlicencias.findUnique({
    where: {
    idTipoLicencia: data.TiposLicencias_idTipoLicenciaMinima
      }
     });

    if (!licencia) {
    throw new AppError("La licencia mínima ingresada no existe");
    }

    const datos = {
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim(),
    precioHora : data.precioHora,
    TiposLicencias_idTipoLicenciaMinima:
    data.TiposLicencias_idTipoLicenciaMinima
  };

    return await prisma.tiposkarting.create({
    data: datos
    });
}

  async update(idTipoKarting: number, data: UpdateTiposKartings) {
this.validarId(idTipoKarting);
this.validarDatos(data);

  const datos = {
    ...(data.nombre !== undefined && {
      nombre: data.nombre.trim()
    }),
    ...(data.descripcion !== undefined && {
      descripcion: data.descripcion.trim()
    }),
    // antes no estaba: el precio nuevo se validaba pero nunca se guardaba
    ...(data.precioHora !== undefined && {
      precioHora: data.precioHora
    }),
    ...(data.TiposLicencias_idTipoLicenciaMinima !== undefined && {
      TiposLicencias_idTipoLicenciaMinima:
        data.TiposLicencias_idTipoLicenciaMinima
    })
  };

  const idLicencia = data.TiposLicencias_idTipoLicenciaMinima;
  if (idLicencia === undefined) {
    return await prisma.tiposkarting.update({ where: { idTiposKarting: idTipoKarting }, data: datos });
  }
  return await prisma.$transaction(async (db) => {
    const licencia = await db.tiposlicencias.findUnique({ where: { idTipoLicencia: idLicencia } });
    if (!licencia) {
      throw new AppError("La licencia mínima ingresada no existe");
    }
    // se bloquean los karts de este tipo (el mismo candado que toman las carreras) antes de validar
    await db.$queryRaw`SELECT idKartings FROM kartings WHERE TiposKarting_idTiposKarting = ${idTipoKarting} FOR UPDATE`;
    await validarLicenciaEnCarrerasFuturas(db, { TiposKarting_idTiposKarting: idTipoKarting }, idLicencia);
    return await db.tiposkarting.update({ where: { idTiposKarting: idTipoKarting }, data: datos });
  }, opcionesTxBloqueo);
}
    async delete(idTipoKarting:number){
        this.validarId(idTipoKarting);
        return await prisma.tiposkarting.delete({
            where:{idTiposKarting : idTipoKarting}
        });
    }
}
export default new TiposKartingsService();