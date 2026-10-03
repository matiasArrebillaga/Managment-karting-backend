// El dia de hoy segun el calendario local, llevado a medianoche UTC. Las columnas DATE se
// guardan asi, y tomar el dia en UTC correria el corte tres horas en Argentina.
// Compartido porque la comparacion "ya paso" aparece en reservas y en inscripciones.
export function hoyUTC(): Date {
    const ahora = new Date();
    return new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));
}
