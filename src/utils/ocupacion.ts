import { Prisma } from "../generated/prisma/client";

type Excluir = {
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
