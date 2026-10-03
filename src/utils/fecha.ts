// El dia de hoy segun el calendario local, llevado a medianoche UTC. Las columnas DATE se
// guardan asi, y tomar el dia en UTC correria el corte tres horas en Argentina.
// Compartido porque la comparacion "ya paso" aparece en reservas y en inscripciones.
export function hoyUTC(): Date {
    const ahora = new Date();
    return new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));
}

// "HH:MM" o "HH:MM:SS" ubicado en la epoch UTC, que es como Prisma lee y escribe TIME(0).
// Compartido por reservas y carreras.
export function normalizarHora(valor: unknown, campo: string): Date {
    if (valor instanceof Date) return valor;
    const partes = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(valor ?? "").trim());
    if (!partes) throw new Error(`El campo ${campo} debe tener formato HH:MM`);
    return new Date(Date.UTC(
        1970, 0, 1,
        Number(partes[1]), Number(partes[2]), Number(partes[3] ?? 0)
    ));
}
