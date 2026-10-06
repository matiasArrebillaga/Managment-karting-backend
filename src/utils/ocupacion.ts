import { Prisma } from "../generated/prisma/client";

type Excluir = {
    idReserva?: number; // reserva en edicion
    // carrera en edicion: kart y fecha ya van en el filtro, con esto queda su clave completa
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
        db.carreras.findMany({
            where: {
                fechaCarrera: fecha,
                ...solape,
                ...(excluir.carrera === undefined ? {} : { NOT: excluir.carrera })
            },
            select
        })
    ]);
    return [...reservas, ...carreras];
}
