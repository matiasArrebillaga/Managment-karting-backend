
import {prisma} from "../../config/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import {
    ClavesCarrera,
    CreateParticipacion,
    ResultadoCarrera,
    UpdateParticipacion
} from "./participacion.interface.js";

// Escala de la F1: del 11° en adelante no suma
const PUNTOS_POR_POSICION = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

class ParticipacionesService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarFecha(fecha: Date) {
        if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) throw new Error("La fecha de carrera no es válida");
    }
    private validarClaves(...ids: number[]) { ids.forEach(id => this.validarId(id)); }

    private validarClavesCarrera(claves: ClavesCarrera) {
        this.validarClaves(claves.Carrera_Kartings_idKartings, claves.Carrera_Torneos_idTorneos, claves.Carrera_Circuitos_idCircuitos);
        this.validarFecha(claves.Carrera_fecha);
    }

    private puntosPorPosicion(posicion: number) {
        return PUNTOS_POR_POSICION[posicion - 1] ?? 0;
    }

    private validarPosicion(posicion: number) {
        if (!Number.isInteger(posicion) || posicion < 1) {
            throw new Error("La posición final debe ser un número entero mayor o igual a 1");
        }
    }

    private validarTiempo(tiempo: string) {
        if (typeof tiempo !== "string" || !/^\d{2}:[0-5]\d:[0-5]\d$/.test(tiempo.trim())) {
            throw new Error("El tiempo debe tener formato HH:MM:SS");
        }
    }

    private validarResultado(resultado: ResultadoCarrera) {
        this.validarId(resultado.Personas_idPersona);
        this.validarPosicion(resultado.posicion_final);
        this.validarTiempo(resultado.tiempo);
    }

    private async obtenerCarrera(claves: ClavesCarrera) {
        const carrera = await prisma.carreras.findUnique({
            where: {
                Kartings_idKartings_Torneos_idTorneos_Circuitos_idCircuitos_fechaCarrera: {
                    Kartings_idKartings: claves.Carrera_Kartings_idKartings,
                    Torneos_idTorneos: claves.Carrera_Torneos_idTorneos,
                    Circuitos_idCircuitos: claves.Carrera_Circuitos_idCircuitos,
                    fechaCarrera: claves.Carrera_fecha
                }
            }
        });
        if (!carrera) throw new AppError("La carrera indicada no existe", 404);
        return carrera;
    }

    // fechaCarrera (DATE) y horaFin (TIME) llegan como instantes UTC que guardan la hora de
    // pared del kartodromo; se rearman en hora local para compararlos contra el reloj.
    private async obtenerCarreraFinalizada(claves: ClavesCarrera) {
        const carrera = await this.obtenerCarrera(claves);
        const f = carrera.fechaCarrera;
        const h = carrera.horaFin;
        const fin = new Date(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate(), h.getUTCHours(), h.getUTCMinutes());
        if (fin > new Date()) {
            throw new Error("No se puede registrar el resultado de una carrera que aun no paso");
        }
        return carrera;
    }

    // Un solo findMany para todos los pilotos; tambien cubre que la persona exista
    private async validarInscriptos(Torneos_idTorneos: number, idsPersonas: number[]) {
        const inscriptos = await prisma.personas_torneos.findMany({
            where: { Torneos_idTorneos, Personas_idPersona: { in: idsPersonas } },
            select: { Personas_idPersona: true }
        });
        const encontrados = new Set(inscriptos.map((i: { Personas_idPersona: number }) => i.Personas_idPersona));
        const faltantes = idsPersonas.filter(id => !encontrados.has(id));
        if (faltantes.length > 0) {
            throw new Error(`Las personas ${faltantes.join(", ")} no están inscriptas en el torneo de esa carrera`);
        }
    }

    private aFila(claves: ClavesCarrera, resultado: ResultadoCarrera) {
        return {
            Carrera_Kartings_idKartings: claves.Carrera_Kartings_idKartings,
            Carrera_Torneos_idTorneos: claves.Carrera_Torneos_idTorneos,
            Carrera_Circuitos_idCircuitos: claves.Carrera_Circuitos_idCircuitos,
            Carrera_fecha: claves.Carrera_fecha,
            Personas_idPersona: resultado.Personas_idPersona,
            posicion_final: resultado.posicion_final,
            tiempo: resultado.tiempo.trim(),
            puntos: this.puntosPorPosicion(resultado.posicion_final)
        };
    }

    private whereClave(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number
    ) {
        this.validarClaves(Carrera_Kartings_idKartings, Carrera_Torneos_idTorneos, Carrera_Circuitos_idCircuitos, Personas_idPersona);
        this.validarFecha(Carrera_fecha);
        return {
            Carrera_Kartings_idKartings_Carrera_Torneos_idTorneos_Carrera_Circuitos_idCircuitos_Carrera_fecha_Personas_idPersona: {
                Carrera_Kartings_idKartings,
                Carrera_Torneos_idTorneos,
                Carrera_Circuitos_idCircuitos,
                Carrera_fecha,
                Personas_idPersona
            }
        };
    }

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
        return await prisma.participaciones.findUnique({
            where: this.whereClave(Carrera_Kartings_idKartings, Carrera_Torneos_idTorneos, Carrera_Circuitos_idCircuitos, Carrera_fecha, Personas_idPersona)
        });
    }

    // Alta de un piloto suelto (el que falto en la carga de la clasificacion).
    // Persona o posicion repetida en la carrera las corta la PK y el unique de la DB (409).
    async registrarParticipacion(data: CreateParticipacion) {
        this.validarClavesCarrera(data);
        this.validarResultado(data);
        await this.obtenerCarreraFinalizada(data);
        await this.validarInscriptos(data.Carrera_Torneos_idTorneos, [data.Personas_idPersona]);
        return await prisma.participaciones.create({ data: this.aFila(data, data) });
    }

    // Carga de la clasificacion completa de una carrera, todo o nada
    async registrarResultadosCarrera(claves: ClavesCarrera, resultados: ResultadoCarrera[]) {
        this.validarClavesCarrera(claves);
        if (!Array.isArray(resultados) || resultados.length === 0) {
            throw new Error("Hay que cargar al menos un resultado");
        }
        resultados.forEach(r => this.validarResultado(r));

        const ids = resultados.map(r => r.Personas_idPersona);
        if (new Set(ids).size !== ids.length) {
            throw new Error("Una persona aparece más de una vez en la clasificación");
        }
        const posiciones = resultados.map(r => r.posicion_final).sort((a, b) => a - b);
        if (!posiciones.every((p, i) => p === i + 1)) {
            throw new Error(`Las posiciones deben ser exactamente de 1 a ${resultados.length}, sin repetir ni saltear`);
        }

        await this.obtenerCarreraFinalizada(claves);
        await this.validarInscriptos(claves.Carrera_Torneos_idTorneos, ids);

        const whereCarrera = {
            Carrera_Kartings_idKartings: claves.Carrera_Kartings_idKartings,
            Carrera_Torneos_idTorneos: claves.Carrera_Torneos_idTorneos,
            Carrera_Circuitos_idCircuitos: claves.Carrera_Circuitos_idCircuitos,
            Carrera_fecha: claves.Carrera_fecha
        };
        // Dos cargas simultaneas chocan contra la PK/unique y la transaccion revierte
        return await prisma.$transaction(async (tx) => {
            if (await tx.participaciones.count({ where: whereCarrera }) > 0) {
                throw new AppError("La carrera ya tiene resultados cargados; corregilos con PUT o DELETE", 409);
            }
            await tx.participaciones.createMany({ data: resultados.map(r => this.aFila(claves, r)) });
            return await tx.participaciones.findMany({ where: whereCarrera, orderBy: { posicion_final: "asc" } });
        });
    }

    // Actualizar una participación: se valida solo lo que viene y la posicion arrastra los puntos.
    // ponytail: intercambiar dos posiciones choca con el unique; hoy es DELETE + POST. Agregar swap si molesta.
    async update(
        Carrera_Kartings_idKartings: number,
        Carrera_Torneos_idTorneos: number,
        Carrera_Circuitos_idCircuitos: number,
        Carrera_fecha: Date,
        Personas_idPersona: number,
        data: UpdateParticipacion
    ) {
        const where = this.whereClave(Carrera_Kartings_idKartings, Carrera_Torneos_idTorneos, Carrera_Circuitos_idCircuitos, Carrera_fecha, Personas_idPersona);
        if (data.tiempo !== undefined) this.validarTiempo(data.tiempo);
        if (data.posicion_final !== undefined) this.validarPosicion(data.posicion_final);

        return await prisma.participaciones.update({
            where,
            data: {
                ...(data.tiempo !== undefined && { tiempo: data.tiempo.trim() }),
                ...(data.posicion_final !== undefined && {
                    posicion_final: data.posicion_final,
                    puntos: this.puntosPorPosicion(data.posicion_final)
                })
            }
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
            where: this.whereClave(Carrera_Kartings_idKartings, Carrera_Torneos_idTorneos, Carrera_Circuitos_idCircuitos, Carrera_fecha, Personas_idPersona)
        });
    }

    // Resultados de una carrera ordenados por posicion. Sin resultados cargados devuelve [].
    async getClasificacionCarrera(claves: ClavesCarrera) {
        this.validarClavesCarrera(claves);
        await this.obtenerCarrera(claves);
        const filas = await prisma.participaciones.findMany({
            where: {
                Carrera_Kartings_idKartings: claves.Carrera_Kartings_idKartings,
                Carrera_Torneos_idTorneos: claves.Carrera_Torneos_idTorneos,
                Carrera_Circuitos_idCircuitos: claves.Carrera_Circuitos_idCircuitos,
                Carrera_fecha: claves.Carrera_fecha
            },
            orderBy: { posicion_final: "asc" },
            include: { personas: { select: { nombre: true, apellido: true } } }
        });
        return filas.map((f: any) => ({
            posicion: f.posicion_final,
            idPersona: f.Personas_idPersona,
            nombre: f.personas.nombre,
            apellido: f.personas.apellido,
            tiempo: f.tiempo,
            puntos: f.puntos
        }));
    }

    // Tabla del torneo con desempate F1: a igual puntaje gana quien tenga mas 1°, despues mas 2°...
    // Empate total comparte posicion y la siguiente salta (1, 1, 3).
    // ponytail: agrega en memoria; alcanza para torneos de decenas de pilotos.
    async getTablaGeneral(idTorneo: number) {
        this.validarId(idTorneo);
        const torneo = await prisma.torneos.findUnique({ where: { idTorneos: idTorneo } });
        if (!torneo) throw new AppError("El torneo indicado no existe", 404);

        const participaciones = await prisma.participaciones.findMany({
            where: { Carrera_Torneos_idTorneos: idTorneo },
            select: { Personas_idPersona: true, puntos: true, posicion_final: true }
        });

        const porPersona = new Map<number, { idPersona: number; puntos: number; conteo: number[] }>();
        for (const p of participaciones) {
            const acumulado = porPersona.get(p.Personas_idPersona)
                ?? { idPersona: p.Personas_idPersona, puntos: 0, conteo: [] };
            acumulado.puntos += p.puntos;
            acumulado.conteo[p.posicion_final - 1] = (acumulado.conteo[p.posicion_final - 1] ?? 0) + 1;
            porPersona.set(p.Personas_idPersona, acumulado);
        }

        // negativo si a va antes que b; 0 si estan empatados del todo
        const comparar = (a: { puntos: number; conteo: number[] }, b: { puntos: number; conteo: number[] }) => {
            if (a.puntos !== b.puntos) return b.puntos - a.puntos;
            for (let i = 0; i < Math.max(a.conteo.length, b.conteo.length); i++) {
                const diferencia = (b.conteo[i] ?? 0) - (a.conteo[i] ?? 0);
                if (diferencia !== 0) return diferencia;
            }
            return 0;
        };
        const ordenados = [...porPersona.values()].sort(comparar);

        const personas = await prisma.personas.findMany({
            where: { idPersona: { in: ordenados.map(o => o.idPersona) } },
            select: { idPersona: true, nombre: true, apellido: true }
        });

        let posicion = 0;
        return ordenados.map((o, i) => {
            if (i === 0 || comparar(ordenados[i - 1], o) !== 0) posicion = i + 1;
            const persona = personas.find((p: { idPersona: number }) => p.idPersona === o.idPersona);
            return {
                posicion,
                idPersona: o.idPersona,
                nombre: persona?.nombre,
                apellido: persona?.apellido,
                puntosTotales: o.puntos,
                victorias: o.conteo[0] ?? 0
            };
        });
    }
}

export default new ParticipacionesService();
