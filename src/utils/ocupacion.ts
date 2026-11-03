import { Prisma } from "../generated/prisma/client";
import { AppError } from "../middleware/error.middleware";

// ReadCommitted: cada lectura ve lo ultimo confirmado y los FOR UPDATE no toman gap locks.
// La correccion la dan los candados explicitos (FOR UPDATE / LOCK IN SHARE MODE), no la foto de REPEATABLE READ.
export const opcionesTxBloqueo = { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted };

// Bloquea siempre en el mismo orden (karts -> circuito -> franja) para que reservas y
// carreras no se crucen en un deadlock. Va al principio de la transaccion, antes de leer.
// ponytail: el kart queda bloqueado para todas sus fechas; pasar a kart + fecha si un kart tiene mucho movimiento.
export async function bloquearFranja(
    db: Prisma.TransactionClient,
    kartings: number[],
    idCircuito: number,
    fecha: Date
) {
    // con la lista vacia Prisma.join arma "IN ()", que es SQL invalido
    if (kartings.length > 0) {
        await db.$queryRaw`SELECT idKartings FROM kartings WHERE idKartings IN (${Prisma.join(kartings)}) FOR UPDATE`;
    }
    // compartido: varias altas del mismo circuito no se esperan, pero editar el circuito (FOR UPDATE) si
    const circuito = await db.$queryRaw<unknown[]>`SELECT idCircuitos FROM circuitos WHERE idCircuitos = ${idCircuito} LOCK IN SHARE MODE`;
    // sin esto el INSERT de abajo falla por la clave foranea y sale como 409 en vez de 400
    if (circuito.length === 0) throw new AppError("El circuito no existe");
    // crea la fila del dia si no existe y en los dos casos la deja bloqueada hasta el commit.
    // la fecha va como texto para que el driver no la corra de dia por la zona horaria
    const dia = fecha.toISOString().slice(0, 10);
    await db.$executeRaw`INSERT INTO franjas_circuito (Circuitos_idCircuitos, fecha) VALUES (${idCircuito}, ${dia}) ON DUPLICATE KEY UPDATE fecha = fecha`;
}

export type Excluir = {
    idReserva?: number; // reserva en edicion
    // carrera en edicion: la fecha ya va en el filtro, con esto queda su clave completa
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
        // una fila por kart de cada carrera, asi el cupo del circuito cuenta todos sus karts
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
