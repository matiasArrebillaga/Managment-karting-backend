import { Prisma } from "../generated/prisma/client";
import { AppError } from "../middleware/error.middleware";
import { hoyUTC } from "./fecha";

// ReadCommitted: cada lectura ve lo ultimo confirmado
// la seguridad la dan los locks explicitos
export const opcionesTxBloqueo = { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted };

// bloquea siempre en el mismo orden (karts -> circuito -> franja) para evitar deadlocks
// va al principio de la transaccion
export async function bloquearFranja(
    db: Prisma.TransactionClient,
    kartings: number[],
    idCircuito: number,
    fecha: Date
) {
    // con la lista vacia arma IN () que es sql invalido
    if (kartings.length > 0) {
        await db.$queryRaw`SELECT idKartings FROM kartings WHERE idKartings IN (${Prisma.join(kartings)}) FOR UPDATE`;
    }
    // compartido: las altas no se esperan, editar el circuito si
    const circuito = await db.$queryRaw<unknown[]>`SELECT idCircuitos FROM circuitos WHERE idCircuitos = ${idCircuito} LOCK IN SHARE MODE`;
    // sino el INSERT falla por clave foranea y da 409 en vez de 400
    if (circuito.length === 0) throw new AppError("El circuito no existe");
    // crea la fila del dia si no existe y la bloquea hasta el commit
    // fecha como texto para que el driver no cambie el dia
    const dia = fecha.toISOString().slice(0, 10);
    await db.$executeRaw`INSERT INTO franjas_circuito (Circuitos_idCircuitos, fecha) VALUES (${idCircuito}, ${dia}) ON DUPLICATE KEY UPDATE fecha = fecha`;
}

export type Excluir = {
    idReserva?: number; // reserva en edicion
    // carrera en edicion
    carrera?: { Torneos_idTorneos: number; Circuitos_idCircuitos: number };
};

// karts y circuitos ocupados en la franja, sumando reservas y carreras
export async function franjaOcupada(
    db: Prisma.TransactionClient,
    fecha: Date,
    horaInicio: Date,
    horaFin: Date,
    excluir: Excluir = {}
) {
    const solape = { horaInicio: { lt: horaFin }, horaFin: { gt: horaInicio } };
    const select = { Kartings_idKartings: true, Circuitos_idCircuitos: true };
    const [reservas, carreras] = await Promise.all([
        db.reservas.findMany({
            where: {
                fechaReserva: fecha,
                ...solape,
                ...(excluir.idReserva === undefined ? {} : { NOT: { idReservas: excluir.idReserva } })
            },
            select
        }),
        // una fila por kart de cada carrera
        db.carreras_kartings.findMany({
            where: {
                carreras: {
                    fechaCarrera: fecha,
                    ...solape,
                    ...(excluir.carrera === undefined ? {} : { NOT: excluir.carrera })
                }
            },
            select: { Kartings_idKartings: true, Carrera_Circuitos_idCircuitos: true }
        })
    ]);
    return [
        ...reservas,
        ...carreras.map(c => ({ Kartings_idKartings: c.Kartings_idKartings, Circuitos_idCircuitos: c.Carrera_Circuitos_idCircuitos }))
    ];
}

// los karts con carreras futuras tienen que seguir siendo de la licencia del torneo
// se usa al cambiar el tipo de un kart o la licencia de un tipo
export async function validarLicenciaEnCarrerasFuturas(
    db: Prisma.TransactionClient,
    kartings: Prisma.kartingsWhereInput,
    idLicencia: number
) {
    const choques = await db.carreras_kartings.findMany({
        where: {
            kartings,
            Carrera_fecha: { gte: hoyUTC() },
            carreras: { torneos: { TiposLicencias_idTipoLicencia: { not: idLicencia } } }
        },
        select: { carreras: { select: { torneos: { select: { nombre: true } } } } }
    });
    if (choques.length > 0) {
        const torneos = [...new Set(choques.map(c => c.carreras.torneos.nombre))];
        throw new AppError(`No se puede cambiar: hay kartings asignados a carreras de ${torneos.join(", ")}, que exigen otra licencia`);
    }
}
