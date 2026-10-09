import {prisma} from "../../config/prisma.js";
import { CreateCarrera, UpdateCarrera } from "../carrera/carrera.interface.js";
import { normalizarHora , normalizarFecha} from "../../utils/fecha.js";
import { AppError } from "../../middleware/error.middleware.js";

class CarrerasService {

    //VALIDACIONES 
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarFecha(fecha: Date, nombre: string) {
        if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) throw new Error(`La ${nombre} no es válida`);
    }
    private validarClaves(...ids: number[]) {
        ids.forEach(id => this.validarId(id));
    }


    private async validarDisponibilidadKarting(
    Kartings_idKartings: number,
    fechaCarrera: Date,
    horaInicio: Date,
    horaFin: Date,
    excluir?: {
        Torneos_idTorneos: number;
        Circuitos_idCircuitos: number;
    }
) {
    const fechaNormalizada = normalizarFecha(fechaCarrera);

    const carrerasDelKarting = await prisma.carreras.findMany({
        where: {
            Kartings_idKartings,
            fechaCarrera: fechaNormalizada
        }
    });

    const haySolape = carrerasDelKarting.some((c) => {
        if (
            excluir &&
            c.Torneos_idTorneos === excluir.Torneos_idTorneos &&
            c.Circuitos_idCircuitos === excluir.Circuitos_idCircuitos
        ) {
            return false;
        }

        return horaInicio < c.horaFin && horaFin > c.horaInicio;
    });

    if (haySolape) {
        throw new Error("El karting ya está asignado en ese horario");
    }
}
private async validarHorarios (horaInicio: Date, horaFin:Date){
        if (isNaN(horaInicio.getTime())|| isNaN(horaFin.getTime())){
            throw new Error("Las horas de inicio y fin no son validas");
        }
        if (horaInicio >= horaFin){
            throw new Error ("La hora de inicio debe ser anterior a la hora de fin");
        }
    }
    private async validarEntidadesRelacionadas(Kartings_idKartings:number,Torneos_idTorneos: number,Circuitos_idCircuitos:number){
        const [karting, torneo, circuito]= await Promise.all([
            prisma.kartings.findUnique({where:{idKartings:Kartings_idKartings}}),
            prisma.torneos.findUnique({where:{idTorneos:Torneos_idTorneos}}),
            prisma.circuitos.findUnique({where:{idCircuitos:Circuitos_idCircuitos}})

        ]);
        if (!karting) throw new Error ("El karting indicado no existe")
        if(!torneo) throw new Error ("El torneo indicado no existe")
        if (!circuito) throw new Error ("El circuito indicado no existe");
        if (circuito.maximo < torneo.cupoMaximo) {
            throw new Error(
                "El circuito no tiene capacidad suficiente para el cupo máximo del torneo"
            );
        }
        if (karting.estado?.toLowerCase() !== "disponible"){
            throw new Error(`El karting no esta disponible (estado: ${karting.estado})`);
        }
        return { torneo };
        }
    private async validarFechaDentroDelTorneo(fechaCarrera: Date, torneo: { fechaInicio: Date; fechaFin: Date }) {
    if (fechaCarrera < torneo.fechaInicio || fechaCarrera > torneo.fechaFin) {
        throw new Error("La fecha de la carrera está fuera del rango del torneo");
        }
    }


    // Obtener todas las carreras
    async getAll() {
        return await prisma.carreras.findMany();
    }

    // Obtener una carrera por su clave primaria compuesta
    async getById(
    fechaCarrera: Date,
    Kartings_idKartings: number,
    Torneos_idTorneos: number,
    Circuitos_idCircuitos: number
) {
    this.validarClaves(
        Kartings_idKartings,
        Torneos_idTorneos,
        Circuitos_idCircuitos
    );

    this.validarFecha(fechaCarrera, "fecha de carrera");
    fechaCarrera = normalizarFecha(fechaCarrera);
        const carrera = await prisma.carreras.findUnique({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings,
                    Torneos_idTorneos,
                    Circuitos_idCircuitos,
                    fechaCarrera
                }
            }
        });
        if (!carrera) throw new AppError("La carrera indicada no existe", 404);
        return carrera;
    }

    async update(
    fechaCarrera: Date,
    Kartings_idKartings: number,
    Torneos_idTorneos: number,
    Circuitos_idCircuitos: number,
    data: UpdateCarrera
) {
    this.validarClaves(
        Kartings_idKartings,
        Torneos_idTorneos,
        Circuitos_idCircuitos
    );

    this.validarFecha(fechaCarrera, "fecha de carrera");
    fechaCarrera = normalizarFecha(fechaCarrera);

    const normalizado: {
        horaInicio?: Date;
        horaFin?: Date;
    } = {};

    if (data.horaInicio !== undefined) {
        normalizado.horaInicio = normalizarHora(
            data.horaInicio,
            "horaInicio"
        );
    }

    if (data.horaFin !== undefined) {
        normalizado.horaFin = normalizarHora(
            data.horaFin,
            "horaFin"
        );
    }

    const actual = await this.getById(
        fechaCarrera,
        Kartings_idKartings,
        Torneos_idTorneos,
        Circuitos_idCircuitos
    );

    const horaInicioFinal =
        normalizado.horaInicio ?? actual.horaInicio;

    const horaFinFinal =
        normalizado.horaFin ?? actual.horaFin;

    await this.validarHorarios(horaInicioFinal, horaFinFinal);

    if (
        normalizado.horaInicio !== undefined ||
        normalizado.horaFin !== undefined
    ) {
        await this.validarDisponibilidadKarting(
            Kartings_idKartings,
            fechaCarrera,
            horaInicioFinal,
            horaFinFinal
        );
    }

    return await prisma.carreras.update({
        where: {
            Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                Kartings_idKartings,
                Torneos_idTorneos,
                Circuitos_idCircuitos,
                fechaCarrera
            }
        },
        data: normalizado
    });
}

    async delete(
    fechaCarrera: Date,
    Kartings_idKartings: number,
    Torneos_idTorneos: number,
    Circuitos_idCircuitos: number
) {
    this.validarClaves(
        Kartings_idKartings,
        Torneos_idTorneos,
        Circuitos_idCircuitos
    );

    this.validarFecha(fechaCarrera, "fecha de carrera");
    fechaCarrera = normalizarFecha(fechaCarrera);

    await this.getById(
        fechaCarrera,
        Kartings_idKartings,
        Torneos_idTorneos,
        Circuitos_idCircuitos
    );

        return await prisma.carreras.delete({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings,
                    Torneos_idTorneos,
                    Circuitos_idCircuitos,
                    fechaCarrera
                }
            }
        });
    }
    
    
async crearCarrera(data: CreateCarrera) {
    this.validarClaves(
        data.Kartings_idKartings,
        data.Torneos_idTorneos,
        data.Circuitos_idCircuitos
    );

    const fechaCarrera = normalizarFecha(data.fechaCarrera);
    this.validarFecha(fechaCarrera, "fecha de carrera");

    const horaInicio = normalizarHora(data.horaInicio, "horaInicio");
    const horaFin = normalizarHora(data.horaFin, "horaFin");

    this.validarHorarios(horaInicio, horaFin);

    return await prisma.$transaction(async (db) => {
        // 1. Bloquear la fila del karting.
        const kartings = await db.$queryRaw<{ idKartings: number }[]>`
            SELECT idKartings
            FROM kartings
            WHERE idKartings = ${data.Kartings_idKartings}
            FOR UPDATE
        `;

        if (kartings.length === 0) {
            throw new Error("El karting indicado no existe");
        }

        // 2. Validar las entidades relacionadas.
        // Estas consultas también deben usar db, dentro
        // de la transacción, no el cliente global prisma.
        const { torneo } = await this.validarEntidadesRelacionadas(
            data.Kartings_idKartings,
            data.Torneos_idTorneos,
            data.Circuitos_idCircuitos
        );

        // 3. Comprobar que la fecha corresponda al torneo.
        await this.validarFechaDentroDelTorneo(fechaCarrera, torneo);

        // 4. Verificar solapamientos con carreras existentes.
        // La función debe consultar mediante db también.
        await this.validarDisponibilidadKarting(
            data.Kartings_idKartings,
            fechaCarrera,
            horaInicio,
            horaFin
        );

        // 5. Crear la carrera dentro de la misma transacción.
        return await db.carreras.create({
            data: {
                fechaCarrera,
                horaInicio,
                horaFin,
                kartings: {
                    connect: { idKartings: data.Kartings_idKartings }
                },
                torneos: {
                    connect: { idTorneos: data.Torneos_idTorneos }
                },
                circuitos: {
                    connect: { idCircuitos: data.Circuitos_idCircuitos }
                }
            }
        });
    });
}

    async getByTorneo(idTorneo: number) {
    this.validarId(idTorneo);
    return await prisma.carreras.findMany({
        where: { Torneos_idTorneos: idTorneo },
        include: {
            circuitos: true,
            kartings: true
        },
        orderBy: { fechaCarrera: "asc" }
    });
}
}

export default new CarrerasService();
