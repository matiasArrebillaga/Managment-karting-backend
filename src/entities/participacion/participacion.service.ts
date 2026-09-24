
import {prisma} from "../../config/prisma.js";
import {
    CreateParticipacion,
    UpdateParticipacion
} from "./participacion.interface.js";

class ParticipacionesService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarFecha(fecha: Date) {
        if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) throw new Error("La fecha de carrera no es válida");
    }
    private validarClaves(...ids: number[]) { ids.forEach(id => this.validarId(id)); }

    // Obtener todas las participaciones
    async getAll() {
        return await prisma.participaciones.findMany();
    }

    // Obtener una participación por su clave primaria compuesta
    async getById(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number
    ) {
        this.validarClaves(Carrera_Kartings_idKartings, Carrera_Torneos_idTorneos, Carrera_Circuitos_idCircuitos, Personas_idPersona);
        this.validarFecha(Carrera_fecha);
        return await prisma.participaciones.findUnique({
            where: {
                Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                }
            }
        });
    }
    
    //Buscar Participacion por fecha
    async getByFecha(
        fechaCarrera: Date
    ) {
        return await prisma.participaciones.findMany({
            where: {Carrera_fecha : fechaCarrera
                }
            })
    }

    // Crear una participación
    async create(data: CreateParticipacion) {
        return await prisma.participaciones.create({
            data: {
                puntos: data.puntos,
                tiempo: data.tiempo,
                posicion_final: data.posicion_final,

                carreras: {
                    connect: {
                        Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                            Kartings_idKartings: data.Carrera_Kartings_idKartings,
                            Torneos_idTorneos: data.Carrera_Torneos_idTorneos,
                            Circuitos_idCircuitos: data.Carrera_Circuitos_idCircuitos,
                            fechaCarrera: data.Carrera_fecha
                        }
                    }
                },

                personas: {
                    connect: {
                        idPersona: data.Personas_idPersona
                    }
                }
            }
        });
    }

    // Actualizar una participación
    async update(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number,
        data: UpdateParticipacion
    ) {
        return await prisma.participaciones.update({
            where: {
                Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                }
            },
            data
        });
    }

    // Eliminar una participación
    async delete(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number
    ) {
        return await prisma.participaciones.delete({
            where: {
                Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                    Carrera_Kartings_idKartings,
                    Carrera_Torneos_idTorneos,
                    Carrera_Circuitos_idCircuitos,
                    Carrera_fecha,
                    Personas_idPersona
                }
            }
        });
    }
    private validarDatos (puntos: number, tiempo: string, posicion_final: string){
        if (!Number.isFinite(puntos)|| !Number.isInteger(puntos) || puntos <0){
            throw new Error ("Los puntos deben ser un numero valido mayor o igual a 0");
        }
        if (typeof tiempo !== "string" || tiempo.trim().length === 0 || tiempo.trim().length > 45 ||
            typeof posicion_final !== "string" || posicion_final.trim().length === 0 || posicion_final.trim().length > 45){
            throw new Error ("El tiempo y la posicion final son obligatorios");
        }
    }
    private async validarCarreraYPersona(
    Carrera_Kartings_idKartings: number,
    Carrera_Torneos_idTorneos: number,
    Carrera_Circuitos_idCircuitos: number,
    Carrera_fecha: Date,
    Personas_idPersona: number
    ){
        const [carrera, persona]= await Promise.all ([
        prisma.carreras.findUnique({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings: Carrera_Kartings_idKartings,
                    Torneos_idTorneos: Carrera_Torneos_idTorneos,
                    Circuitos_idCircuitos: Carrera_Circuitos_idCircuitos,
                    fechaCarrera: Carrera_fecha
                }
            }
        }),
        prisma.personas.findUnique({ where: { idPersona: Personas_idPersona } })            
        ]);
        if (!carrera) throw new Error ("La carrera indicada no existe");
        if (!persona) throw new Error ("La persona indicada no existe");
        return {carrera};
    }
    private validarCarreraFinalizada(carrera: {fechaCarrera:Date;horaFin:Date}){
        const ahora = new Date();
        const fechaFinCarrera = new Date(carrera.fechaCarrera);
        fechaFinCarrera.setHours(
            carrera.horaFin.getHours(),
            carrera.horaFin.getMinutes()
        );
        if (fechaFinCarrera> ahora){
            throw new Error ("No se puede registrar el resultado de una carrera que aun no paso"); 
        }
    }
    private async validarInscripcionAlTorneo(Torneos_idTorneos: number, Personas_idPersona: number) {
     const inscripcion = await prisma.personas_torneos.findUnique({
            where: {
               Torneos_idTorneos_Personas_idPersona: {
                 Torneos_idTorneos,
                    Personas_idPersona
             }
         }
     });

     if (!inscripcion) {
           throw new Error("La persona no está inscripta en el torneo de esa carrera");
     }
    }
    private async validarParticipacionNoDuplicada(
    Carrera_Kartings_idKartings: number,
    Carrera_Torneos_idTorneos: number,
    Carrera_Circuitos_idCircuitos: number,
    Carrera_fecha: Date,
    Personas_idPersona: number
) {
    const existente = await this.getById(
        Carrera_Kartings_idKartings,
        Carrera_Torneos_idTorneos,
        Carrera_Circuitos_idCircuitos,
        Carrera_fecha,
        Personas_idPersona
    );

    if (existente) {
        throw new Error("Ya existe una participación registrada para esta persona en esta carrera");
    }
    }
    async registrarParticipacion(data: CreateParticipacion) {
    this.validarClaves(data.Carrera_Kartings_idKartings, data.Carrera_Torneos_idTorneos, data.Carrera_Circuitos_idCircuitos, data.Personas_idPersona);
    this.validarFecha(data.Carrera_fecha);
    this.validarDatos(data.puntos, data.tiempo, data.posicion_final);

    const { carrera } = await this.validarCarreraYPersona(
        data.Carrera_Kartings_idKartings,
        data.Carrera_Torneos_idTorneos,
        data.Carrera_Circuitos_idCircuitos,
        data.Carrera_fecha,
        data.Personas_idPersona
    );

    this.validarCarreraFinalizada(carrera);

    await this.validarInscripcionAlTorneo(
        data.Carrera_Torneos_idTorneos,
        data.Personas_idPersona
    );

    await this.validarParticipacionNoDuplicada(
        data.Carrera_Kartings_idKartings,
        data.Carrera_Torneos_idTorneos,
        data.Carrera_Circuitos_idCircuitos,
        data.Carrera_fecha,
        data.Personas_idPersona
    );

    return await this.create({...data, tiempo: data.tiempo.trim(), posicion_final: data.posicion_final.trim()});
}
async getTablaGeneral(idTorneo: number) {
    const resultados = await prisma.participaciones.groupBy({
        by: ["Personas_idPersona"],
        where: { Carrera_Torneos_idTorneos: idTorneo },
        _sum: { puntos: true },
        orderBy: { _sum: { puntos: "desc" } }
    });

    const personaIds = resultados.map((r: { Personas_idPersona: any; }) => r.Personas_idPersona);
    const personas = await prisma.personas.findMany({
        where: { idPersona: { in: personaIds } },
        select: { idPersona: true, nombre: true, apellido: true }
    });

    return resultados.map((r: { Personas_idPersona: any; _sum: { puntos: any; }; }, i: number) => {
        const persona = personas.find((p: { idPersona: any; }) => p.idPersona === r.Personas_idPersona);
        return {
            posicion: i + 1,
            idPersona: r.Personas_idPersona,
            nombre: persona?.nombre,
            apellido: persona?.apellido,
            puntosTotales: r._sum.puntos ?? 0
        };
    });
}
}

export default new ParticipacionesService();
