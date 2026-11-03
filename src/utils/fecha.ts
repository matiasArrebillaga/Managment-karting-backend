import { AppError } from "../middleware/error.middleware";

const formatoArgentina = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    hourCycle: "h23",
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric"
});

// la hora de pared de Argentina guardada como si fuera UTC, igual que los DATE y TIME de la base.
// no depende del TZ del proceso (en Docker y Railway es UTC)
export function ahoraArgentina(ahora: Date = new Date()): Date {
    const p = Object.fromEntries(
        formatoArgentina.formatToParts(ahora).map(parte => [parte.type, Number(parte.value)])
    );
    return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second));
}

export function hoyUTC(): Date {
    const ahora = ahoraArgentina();
    return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
}

// la hora actual de Argentina en el formato de las columnas TIME (1970-01-01 en UTC)
export function horaActualUTC(): Date {
    const ahora = ahoraArgentina();
    return new Date(Date.UTC(1970, 0, 1, ahora.getUTCHours(), ahora.getUTCMinutes(), ahora.getUTCSeconds()));
}

export function normalizarHora(valor: unknown, campo: string): Date {
    if (valor instanceof Date) return valor;
    const partes = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(valor ?? "").trim());
    if (!partes) throw new AppError(`El campo ${campo} debe tener formato HH:MM`);
    return new Date(Date.UTC(
        1970, 0, 1,
        Number(partes[1]), Number(partes[2]), Number(partes[3] ?? 0)
    ));
}


export function normalizarFecha(fecha: Date | string): Date {
    const valor = fecha instanceof Date ? fecha : new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
        throw new AppError("La fecha no es válida");
    }

    return new Date(
        Date.UTC(
            valor.getUTCFullYear(),
            valor.getUTCMonth(),
            valor.getUTCDate()
        )
    );
}
