import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../middleware/error.middleware";
import { CreateReserva, CreateReservaInput, UpdateReservaInput } from "./reserva.interface";

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

    // La columna es DATE, asi que si la fecha llega con hora el filtro de solapamientos
    // busca un instante exacto que no existe en la tabla y el control pasa de largo.
    // Se normaliza una sola vez y se usa el mismo valor para validar y para guardar.
    private normalizarFecha(fecha: Date | string): Date {
        const valor = new Date(fecha);
        if (Number.isNaN(valor.getTime())) throw new Error("La fecha de reserva no es válida");
        return new Date(Date.UTC(valor.getUTCFullYear(), valor.getUTCMonth(), valor.getUTCDate()));
    }

    // El dia de hoy segun el calendario local, llevado a medianoche UTC igual que
    // normalizarFecha. Tomar el dia en UTC correria el corte tres horas en Argentina.
    private hoy(): Date {
        const ahora = new Date();
        return new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));
    }

    // Acepta "HH:MM" o "HH:MM:SS" y lo ubica sobre la epoch en UTC, que es como Prisma
    // representa una columna TIME. Asi la hora guardada no depende de la zona del servidor.
    private normalizarHora(valor: unknown, campo: string): Date {
        if (valor instanceof Date) return valor;
        const partes = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(valor ?? "").trim());
        if (!partes) throw new Error(`El campo ${campo} debe tener formato HH:MM`);
        return new Date(Date.UTC(
            1970, 0, 1,
            Number(partes[1]), Number(partes[2]), Number(partes[3] ?? 0)
        ));
    }

    // Un body form-encoded manda los ids como texto; validarId es el que despues decide.
    private aEntero(valor: unknown): number {
        return Number(valor);
    }

    // Las horas vienen de columnas TIME, que Prisma representa como un Date sobre el
    // 1/1/1970 UTC. Al restarlas el desfase horario se cancela, asi que la duracion es
    // correcta sin depender de la zona del servidor.
    private horasReservadas(horaInicio: Date, horaFin: Date): number {
        if (Number.isNaN(horaInicio.getTime()) || Number.isNaN(horaFin.getTime())) {
            throw new Error("Las horas de inicio y fin no son válidas");
        }
        const duracion = horaFin.getTime() - horaInicio.getTime();
        if (duracion <= 0) throw new Error("La hora de inicio debe ser anterior a la hora de fin");
        if (duracion % MS_POR_HORA !== 0) throw new Error("La reserva debe ser de horas enteras");
        return duracion / MS_POR_HORA;
    }

    private async validarLicencia(Personas_idPersona: number, nivelRequerido: number) {
        const licenciaValida = await prisma.licencias.findFirst({
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

    // Un solo query trae las reservas que se pisan con la franja pedida y de ahi salen
    // los dos controles: que el karting este libre y que el circuito no se pase de su
    // maximo de kartings simultaneos.
    private async validarDisponibilidad(
        data: CreateReserva,
        fechaReserva: Date,
        maximoCircuito: number,
        idReservaExcluida?: number
    ) {
        const solapadas = await prisma.reservas.findMany({
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

    // Validacion unica, compartida por el alta y por la modificacion: asi un PATCH no
    // puede dejar la reserva en un estado que el alta habria rechazado.
    // Devuelve el monto calculado, que nunca sale de la request.
    private async validarYCalcularMonto(data: CreateReserva, opciones: OpcionesValidacion) {
        for (const campo of ["Personas_idPersona", "Circuitos_idCircuitos", "Kartings_idKartings"] as const) {
            this.validarId(data[campo]);
        }
        const fechaReserva = this.normalizarFecha(data.fechaReserva);
        const horas = this.horasReservadas(data.horaInicio, data.horaFin);

        if (opciones.fechaEsNueva && fechaReserva < this.hoy()) {
            throw new Error("No se puede reservar en una fecha pasada");
        }

        const [persona, karting, circuito] = await Promise.all([
            prisma.personas.findUnique({ where: { idPersona: data.Personas_idPersona } }),
            prisma.kartings.findUnique({
                where: { idKartings: data.Kartings_idKartings },
                include: { tiposkarting: { include: { tiposlicencias: true } } }
            }),
            prisma.circuitos.findUnique({ where: { idCircuitos: data.Circuitos_idCircuitos } })
        ]);
        if (!persona) throw new Error("La persona no existe");
        if (!karting) throw new Error("El karting no existe");
        if (!circuito) throw new Error("El circuito no existe");

        // Mismo criterio que usa carrera.service para no asignar un kart fuera de servicio
        if (opciones.kartingEsNuevo && karting.estado?.toLowerCase() !== "disponible") {
            throw new Error(`El karting no está disponible (estado: ${karting.estado})`);
        }

        await this.validarLicencia(
            data.Personas_idPersona,
            karting.tiposkarting.tiposlicencias.nivel
        );
        await this.validarDisponibilidad(
            data, fechaReserva, circuito.maximo, opciones.idReservaExcluida
        );

        // Decimal en lugar de numeros de JS para que la plata no arrastre errores de redondeo
        return new Prisma.Decimal(karting.tiposkarting.precioHora).mul(horas);
    }

    async getAll() {
        return await prisma.reservas.findMany();
    }

    async getById(idReservas: number) {
        this.validarId(idReservas);
        return await prisma.reservas.findUnique({
            where: { idReservas },
        });
    }

    // Las reservas de una persona. Es lo que consume GET /api/reservas/mias, para que
    // un cliente pueda ver lo suyo sin necesidad de poder listar las de todos.
    async getPorPersona(Personas_idPersona: number) {
        this.validarId(Personas_idPersona);
        return await prisma.reservas.findMany({
            where: { Personas_idPersona },
            orderBy: [{ fechaReserva: "desc" }, { horaInicio: "asc" }]
        });
    }

    // restringirAPersona: cuando viene, la operacion queda limitada a las reservas de
    // esa persona. El controller lo manda para un CLIENTE y lo omite para EMPLEADO y
    // ADMIN. Vive en el service para que ningun caller nuevo pueda saltearlo.
    private verificarPertenencia(duenio: number, restringirAPersona?: number) {
        if (restringirAPersona !== undefined && duenio !== restringirAPersona) {
            throw new AppError("No podés operar sobre la reserva de otra persona", 403);
        }
    }

    async realizarReserva(data: CreateReservaInput, restringirAPersona?: number) {
        // El monto que venga en el body se ignora: se calcula aca abajo.
        const entrada: CreateReserva = {
            fechaReserva: new Date(data.fechaReserva),
            horaInicio: this.normalizarHora(data.horaInicio, "horaInicio"),
            horaFin: this.normalizarHora(data.horaFin, "horaFin"),
            Personas_idPersona: this.aEntero(data.Personas_idPersona),
            Circuitos_idCircuitos: this.aEntero(data.Circuitos_idCircuitos),
            Kartings_idKartings: this.aEntero(data.Kartings_idKartings)
        };

        // Un CLIENTE no elige a nombre de quien reserva: se le impone su propio id,
        // asi que tampoco necesita mandarlo.
        const datos: CreateReserva = restringirAPersona === undefined
            ? entrada
            : { ...entrada, Personas_idPersona: restringirAPersona };

        const monto = await this.validarYCalcularMonto(datos, {
            fechaEsNueva: true,
            kartingEsNuevo: true
        });
        return await prisma.reservas.create({
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
    }

    async update(idReservas: number, data: UpdateReservaInput, restringirAPersona?: number) {
        this.validarId(idReservas);
        const actual = await prisma.reservas.findUnique({ where: { idReservas } });
        if (!actual) throw new Error("La reserva indicada no existe");
        this.verificarPertenencia(actual.Personas_idPersona, restringirAPersona);

        // Se valida la reserva completa resultante, no solo los campos que cambian.
        // Se arma campo por campo, asi lo que el body traiga de mas (monto incluido)
        // no llega a la base.
        const resultante: CreateReserva = {
            fechaReserva: data.fechaReserva !== undefined
                ? new Date(data.fechaReserva)
                : actual.fechaReserva,
            horaInicio: data.horaInicio !== undefined
                ? this.normalizarHora(data.horaInicio, "horaInicio")
                : actual.horaInicio,
            horaFin: data.horaFin !== undefined
                ? this.normalizarHora(data.horaFin, "horaFin")
                : actual.horaFin,
            // forzado al propio: un cliente tampoco puede pasarle la reserva a otro
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

        const monto = await this.validarYCalcularMonto(resultante, {
            idReservaExcluida: idReservas,
            fechaEsNueva: data.fechaReserva !== undefined,
            kartingEsNuevo: data.Kartings_idKartings !== undefined
        });
        return await prisma.reservas.update({
            where: { idReservas },
            data: {
                ...resultante,
                fechaReserva: this.normalizarFecha(resultante.fechaReserva),
                monto
            }
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
