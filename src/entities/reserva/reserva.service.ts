import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../middleware/error.middleware";
import { CreateReserva, CreateReservaInput, UpdateReservaInput } from "./reserva.interface";
import { hoyUTC, normalizarHora } from "../../utils/fecha";

const MS_POR_HORA = 60 * 60 * 1000;

// Reglas que solo corresponden cuando el campo se esta asignando: en un PATCH que no
// manda fecha no tiene sentido rechazar la reserva por tener una fecha vieja.
type OpcionesValidacion = {
    idReservaExcluida?: number;
    fechaEsNueva: boolean;
    kartingEsNuevo: boolean;
};

class ReservaService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }

    private normalizarFecha(fecha: Date | string): Date {
        const valor = new Date(fecha);
        if (Number.isNaN(valor.getTime())) throw new Error("La fecha de reserva no es válida");
        return new Date(Date.UTC(valor.getUTCFullYear(), valor.getUTCMonth(), valor.getUTCDate()));
    }

    //  manda los ids como texto validarId es el que despues decide.
    private aEntero(valor: unknown): number {
        return Number(valor);
    }
    // transforma las dos fechas en cantidad de horas para el precio tambien valida
    private horasReservadas(horaInicio: Date, horaFin: Date): number {
        if (Number.isNaN(horaInicio.getTime()) || Number.isNaN(horaFin.getTime())) {
            throw new Error("Las horas de inicio y fin no son válidas");
        }
        const duracion = horaFin.getTime() - horaInicio.getTime();
        if (duracion <= 0) throw new Error("La hora de inicio debe ser anterior a la hora de fin");
        if (duracion % MS_POR_HORA !== 0) throw new Error("La reserva debe ser de horas enteras");
        return duracion / MS_POR_HORA;
    }

    //bloquea karting y circuitos para evitar problemas de solapamiento y sea una transaccion
    private async bloquearRecursos(db: Prisma.TransactionClient, idKart: number, idCirc: number) {
        await db.$queryRaw`SELECT idKartings FROM kartings WHERE idKartings = ${idKart} FOR UPDATE`;
        await db.$queryRaw`SELECT idCircuitos FROM circuitos WHERE idCircuitos = ${idCirc} FOR UPDATE`;
    }

    private async validarLicencia(
        db: Prisma.TransactionClient,
        Personas_idPersona: number,
        nivelRequerido: number
    ) {
        const licenciaValida = await db.licencias.findFirst({
            where: {
                Personas_idPersona,
                fechaVencimiento: { gte: new Date() },
                tiposlicencias: { nivel: { gte: nivelRequerido } }
            }
        });
        if (!licenciaValida) {
            throw new Error(
                "La persona no cuenta con una licencia de nivel suficiente para el karting"
            );
        }
    }
  
     async listarReservasRango(fechaInicio : Date , fechaFin : Date){
        const reservas = await prisma.reservas.findMany({
    where: {
        fechaReserva: {
            gte: fechaInicio,
            lte: fechaFin
        }
    },
    include: {
        personas: true,
        kartings: true
    }
});
        return reservas.map(res => ({
            reserva : res.idReservas,
            karting : res.Kartings_idKartings,
            persona : res.Personas_idPersona

        }))
    }
    
    // valida que el karting este disponible para el rango horario y el cupo maximo del circuito
    private async validarDisponibilidad(
        db: Prisma.TransactionClient,    // se agrego que sean transacciones
        data: CreateReserva,
        fechaReserva: Date,
        maximoCircuito: number,
        idReservaExcluida?: number
    ) {
        const solapadas = await db.reservas.findMany({
            where: {
                fechaReserva,
                horaInicio: { lt: data.horaFin },
                horaFin: { gt: data.horaInicio },
                ...(idReservaExcluida === undefined ? {} : { NOT: { idReservas: idReservaExcluida } })
            },
            select: { Kartings_idKartings: true, Circuitos_idCircuitos: true }
        });

        if (solapadas.some(r => r.Kartings_idKartings === data.Kartings_idKartings)) {
            throw new Error("El karting seleccionado ya está reservado en ese horario");
        }

        const enElCircuito = solapadas.filter(
            r => r.Circuitos_idCircuitos === data.Circuitos_idCircuitos
        ).length;
        if (enElCircuito >= maximoCircuito) {
            throw new Error("El circuito alcanzo el cupo maximo de kartings para ese horario");
        }
    }

    // funcion principal de reserva valida los datos y calcula el precio
    private async validarYCalcularMonto(
        db: Prisma.TransactionClient, // transaccion
        data: CreateReserva,
        opciones: OpcionesValidacion
    ) {
        for (const campo of ["Personas_idPersona", "Circuitos_idCircuitos", "Kartings_idKartings"] as const) {
            this.validarId(data[campo]);
        }
        const fechaReserva = this.normalizarFecha(data.fechaReserva);
        const horas = this.horasReservadas(data.horaInicio, data.horaFin);

        if (opciones.fechaEsNueva && fechaReserva < hoyUTC()) { // uso del nuevo util
            throw new Error("No se puede reservar en una fecha pasada");
        }

        await this.bloquearRecursos(db, data.Kartings_idKartings, data.Circuitos_idCircuitos);

        const [persona, karting, circuito] = await Promise.all([
            db.personas.findUnique({ where: { idPersona: data.Personas_idPersona } }),
            db.kartings.findUnique({ // uso de las transacciones
                where: { idKartings: data.Kartings_idKartings },
                include: { tiposkarting: { include: { tiposlicencias: true } } }
            }),
            db.circuitos.findUnique({ where: { idCircuitos: data.Circuitos_idCircuitos } })
        ]);
        if (!persona) throw new Error("La persona no existe");
        if (!karting) throw new Error("El karting no existe");
        if (!circuito) throw new Error("El circuito no existe");

        // mismo criterio que usa carrera.service para no asignar un kart fuera de servicio
        if (opciones.kartingEsNuevo && karting.estado?.toLowerCase() !== "disponible") {
            throw new Error(`El karting no está disponible (estado: ${karting.estado})`);
        }

        await this.validarLicencia(
            db,
            data.Personas_idPersona,
            karting.tiposkarting.tiposlicencias.nivel
        );
        await this.validarDisponibilidad(
            db, data, fechaReserva, circuito.maximo, opciones.idReservaExcluida
        );

        // decimal en lugar de numeros de JS para que la plata no arrastre errores de redondeo
        return new Prisma.Decimal(karting.tiposkarting.precioHora).mul(horas);
    }

    async getAll() {
        return await prisma.reservas.findMany();
    }

    async getById(idReservas: number, restringirAPersona?: number) {
        this.validarId(idReservas);
        const reserva = await prisma.reservas.findUnique({
            where: { idReservas },
        });
        // 404 y no 403: a un cliente no le decimos que la reserva de otro existe
        if (reserva && restringirAPersona !== undefined
            && reserva.Personas_idPersona !== restringirAPersona) return null;
        return reserva;
    }

    // obtiene todas las reservas de una persona 
    async getPorPersona(Personas_idPersona: number) {
        this.validarId(Personas_idPersona);
        return await prisma.reservas.findMany({
            where: { Personas_idPersona },
            orderBy: [{ fechaReserva: "desc" }, { horaInicio: "asc" }]
        });
    }
    // valida que puedas actualizar solo tu propia reserva
    private verificarPertenencia(duenio: number, restringirAPersona?: number) {
        if (restringirAPersona !== undefined && duenio !== restringirAPersona) {
            throw new AppError("No podés operar sobre la reserva de otra persona", 403);
        }
    }

    async realizarReserva(data: CreateReservaInput, restringirAPersona?: number) {
        // El monto que venga en el body se ignora: se calcula aca abajo.
        const entrada: CreateReserva = {
            fechaReserva: new Date(data.fechaReserva),
            horaInicio: normalizarHora(data.horaInicio, "horaInicio"),
            horaFin: normalizarHora(data.horaFin, "horaFin"),
            Personas_idPersona: this.aEntero(data.Personas_idPersona),
            Circuitos_idCircuitos: this.aEntero(data.Circuitos_idCircuitos),
            Kartings_idKartings: this.aEntero(data.Kartings_idKartings)
        };

        // el cliente no elige a nombre de quien reserva: se le impone su propio id,
        // asi que tampoco necesita mandarlo.
        const datos: CreateReserva = restringirAPersona === undefined
            ? entrada
            : { ...entrada, Personas_idPersona: restringirAPersona };

        // transaccion y creacion de la reserva final
        return await prisma.$transaction(async (db) => {
            const monto = await this.validarYCalcularMonto(db, datos, {
                fechaEsNueva: true,
                kartingEsNuevo: true
            });
            return await db.reservas.create({
                data: {
                    fechaReserva: this.normalizarFecha(datos.fechaReserva),
                    horaInicio: datos.horaInicio,
                    horaFin: datos.horaFin,
                    monto,
                    Personas_idPersona: datos.Personas_idPersona,
                    Circuitos_idCircuitos: datos.Circuitos_idCircuitos,
                    Kartings_idKartings: datos.Kartings_idKartings
                }
            });
        });
    }
    // tiene las mismas validacion que create 
    async update(idReservas: number, data: UpdateReservaInput, restringirAPersona?: number) {
        this.validarId(idReservas);
        const actual = await prisma.reservas.findUnique({ where: { idReservas } });
        if (!actual) throw new Error("La reserva indicada no existe");
        this.verificarPertenencia(actual.Personas_idPersona, restringirAPersona);
        const resultante: CreateReserva = {
            // cambia solo los campos necesarios y deja los otros igual    
            fechaReserva: data.fechaReserva !== undefined
                ? new Date(data.fechaReserva)
                : actual.fechaReserva,
            horaInicio: data.horaInicio !== undefined
                ? normalizarHora(data.horaInicio, "horaInicio")
                : actual.horaInicio,
            horaFin: data.horaFin !== undefined
                ? normalizarHora(data.horaFin, "horaFin")
                : actual.horaFin,
            // un cliente tampoco puede pasarle la reserva a otro
            Personas_idPersona: restringirAPersona
                ?? (data.Personas_idPersona !== undefined
                    ? this.aEntero(data.Personas_idPersona)
                    : actual.Personas_idPersona),
            Circuitos_idCircuitos: data.Circuitos_idCircuitos !== undefined
                ? this.aEntero(data.Circuitos_idCircuitos)
                : actual.Circuitos_idCircuitos,
            Kartings_idKartings: data.Kartings_idKartings !== undefined
                ? this.aEntero(data.Kartings_idKartings)
                : actual.Kartings_idKartings
        };

        return await prisma.$transaction(async (db) => {
            const monto = await this.validarYCalcularMonto(db, resultante, {
                idReservaExcluida: idReservas,
                fechaEsNueva: data.fechaReserva !== undefined,
                kartingEsNuevo: data.Kartings_idKartings !== undefined
            });
            return await db.reservas.update({
                where: { idReservas },
                data: {
                    ...resultante,
                    fechaReserva: this.normalizarFecha(resultante.fechaReserva),
                    monto
                }
            });
        });
    }

    async delete(idReservas: number, restringirAPersona?: number) {
        this.validarId(idReservas);
        if (restringirAPersona !== undefined) {
            const actual = await prisma.reservas.findUnique({ where: { idReservas } });
            if (!actual) throw new Error("La reserva indicada no existe");
            this.verificarPertenencia(actual.Personas_idPersona, restringirAPersona);
        }
        return await prisma.reservas.delete({
            where: { idReservas },
        });
    }
}
export default new ReservaService();
