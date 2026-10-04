
export function hoyUTC(): Date {
    const ahora = new Date();
    return new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()));
}

export function normalizarHora(valor: unknown, campo: string): Date {
    if (valor instanceof Date) return valor;
    const partes = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(valor ?? "").trim());
    if (!partes) throw new Error(`El campo ${campo} debe tener formato HH:MM`);
    return new Date(Date.UTC(
        1970, 0, 1,
        Number(partes[1]), Number(partes[2]), Number(partes[3] ?? 0)
    ));
}
