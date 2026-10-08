import {prisma} from "../../config/prisma.js";
import { CreateCarrera, UpdateCarrera } from "../carrera/carrera.interface.js";
import { normalizarHora } from "../../utils/fecha.js";
import { franjaOcupada } from "../../utils/ocupacion.js";
import { AppError } from "../../middleware/error.middleware.js";

class CarrerasService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarFecha(fecha: Date, nombre: string) {
        if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) throw new Error(`La ${nombre} no es válida`);
    }
    private validarClaves(...ids: number[]) {
        ids.forEach(id => this.validarId(id));
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
        this.validarClaves(Kartings_idKartings, Torneos_idTorneos, Circuitos_idCircuitos);
        this.validarFecha(fechaCarrera, "fecha de carrera");
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

    // Actualizar una carrera
    async update(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number,
        data: UpdateCarrera
    ) {
        this.validarClaves(Kartings_idKartings, Torneos_idTorneos, Circuitos_idCircuitos);
        this.validarFecha(fechaCarrera, "fecha de carrera");

        const normalizado: { horaInicio?: Date; horaFin?: Date } = {};
        if (data.horaInicio !== undefined) {
            normalizado.horaInicio = normalizarHora(data.horaInicio, "horaInicio");
        }
        if (data.horaFin !== undefined) {
            normalizado.horaFin = normalizarHora(data.horaFin, "horaFin");
        }

        if (normalizado.horaInicio !== undefined || normalizado.horaFin !== undefined) {
            const actual = await this.getById(fechaCarrera, Kartings_idKartings, Torneos_idTorneos, Circuitos_idCircuitos);
            const horaInicio = normalizado.horaInicio ?? actual.horaInicio;
            const horaFin = normalizado.horaFin ?? actual.horaFin;
            await this.validarHorarios(horaInicio, horaFin);
            // se excluye a si misma del control de solape
            await this.validarDisponibilidadKarting(
                Kartings_idKartings, fechaCarrera, horaInicio, horaFin, { Torneos_idTorneos, Circuitos_idCircuitos }
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

    // Eliminar una carrera
    async delete(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number
    ) {
        this.validarClaves(Kartings_idKartings, Torneos_idTorneos, Circuitos_idCircuitos);
        this.validarFecha(fechaCarrera, "fecha de carrera");

        await this.getById(fechaCarrera, Kartings_idKartings, Torneos_idTorneos, Circuitos_idCircuitos);

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
    private async validarDisponibilidadKarting(
        Kartings_idKartings: number,
        fechaCarrera: Date,
        horaInicio:Date,
        horaFin:Date,
        excluir?: { Torneos_idTorneos: number; Circuitos_idCircuitos: number }
    ){
        // mira carreras y reservas
        const ocupadas = await franjaOcupada(prisma, fechaCarrera, horaInicio, horaFin, { carrera: excluir });
        if (ocupadas.some(o => o.Kartings_idKartings === Kartings_idKartings)){
            throw new Error ("El karting ya esta asignado en ese horario");
        }
    }
    async crearCarrera(data: CreateCarrera) {
        this.validarClaves(data.Kartings_idKartings, data.Torneos_idTorneos, data.Circuitos_idCircuitos);
        this.validarFecha(data.fechaCarrera, "fecha de carrera");

        const horaInicio = normalizarHora(data.horaInicio, "horaInicio");
        const horaFin = normalizarHora(data.horaFin, "horaFin");

        await this.validarHorarios(horaInicio, horaFin);
        const { torneo } = await this.validarEntidadesRelacionadas(
            data.Kartings_idKartings, data.Torneos_idTorneos, data.Circuitos_idCircuitos
        );
        await this.validarFechaDentroDelTorneo(data.fechaCarrera, torneo);
        await this.validarDisponibilidadKarting(
            data.Kartings_idKartings, data.fechaCarrera, horaInicio, horaFin
        );

        return await prisma.carreras.create({
            data: {
                fechaCarrera: data.fechaCarrera,
                horaInicio,
                horaFin,
                kartings: { connect: { idKartings: data.Kartings_idKartings } },
                torneos: { connect: { idTorneos: data.Torneos_idTorneos } },
                circuitos: { connect: { idCircuitos: data.Circuitos_idCircuitos } }
            }
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
