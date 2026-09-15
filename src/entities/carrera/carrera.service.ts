import {prisma} from "../../config/prisma.js";
import { CreateCarrera, UpdateCarrera } from "../carrera/carrera.interface.js";

class CarrerasService {

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
        return await prisma.carreras.findUnique({
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

    // Crear una carrera
    async create(data: CreateCarrera) {
        return await prisma.carreras.create({
            data: {
                fechaCarrera: data.fechaCarrera,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,

                kartings: {
                    connect: {
                        idKartings: data.Kartings_idKartings
                    }
                },

                torneos: {
                    connect: {
                        idTorneos: data.Torneos_idTorneos
                    }
                },

                circuitos: {
                    connect: {
                        idCircuitos: data.Circuitos_idCircuitos
                    }
                }
            }
        });
    }

    // Actualizar una carrera
    async update(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number,
        data: UpdateCarrera
    ) {
        return await prisma.carreras.update({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings,
                    Torneos_idTorneos,
                    Circuitos_idCircuitos,
                    fechaCarrera
                }
            },
            data
        });
    }

    // Eliminar una carrera
    async delete(
        fechaCarrera: Date,
        Kartings_idKartings: number,
        Torneos_idTorneos: number,
        Circuitos_idCircuitos: number
    ) {
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
        if (karting.estado?.toLowerCase() !== "disponible"){
            throw new Error("El karting no esta disponible (estado: ${karting.estado})");
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
        horaFin:Date
    ){
        const carrerasDelKarting = await prisma.carreras.findMany({
            where: {Kartings_idKartings, fechaCarrera},
        });
        const haySolape = carrerasDelKarting.some(
            (c: { horaInicio: Date; horaFin: Date }) =>
                horaInicio < c.horaFin && horaFin > c.horaInicio
        );
        if (haySolape){
            throw new Error ("El karting ya esta asignado en ese horario");
        }
    }
    async crearCarrera(data: CreateCarrera) {
        await this.validarHorarios(data.horaInicio, data.horaFin);
        const { torneo } = await this.validarEntidadesRelacionadas(
            data.Kartings_idKartings, data.Torneos_idTorneos, data.Circuitos_idCircuitos
        );
        await this.validarFechaDentroDelTorneo(data.fechaCarrera, torneo);
        await this.validarDisponibilidadKarting(
            data.Kartings_idKartings, data.fechaCarrera, data.horaInicio, data.horaFin
     );

    return await this.create(data); 
}

}

export default new CarrerasService();
