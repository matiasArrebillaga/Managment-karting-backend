import { AppError } from "../middleware/error.middleware";

// partes como numeros 0-23
const formatoArgentina = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    hourCycle: "h23",
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric"
});

// hora de argentina guardada como utc, igual que los DATE y TIME
// no depende del TZ del server
export function ahoraArgentina(ahora: Date = new Date()): Date {
    const p = Object.fromEntries(
        formatoArgentina.formatToParts(ahora).map(parte => [parte.type, Number(parte.value)])
    );
    return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second));
}

// hoy a medianoche utc
export function hoyUTC(): Date {
    const ahora = ahoraArgentina();
    return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
}

// hora actual de argentina en formato TIME (1970-01-01 utc)
export function horaActualUTC(): Date {
    const ahora = ahoraArgentina();
    return new Date(Date.UTC(1970, 0, 1, ahora.getUTCHours(), ahora.getUTCMinutes(), ahora.getUTCSeconds()));
}

// "HH:MM" a TIME
export function normalizarHora(valor: unknown, campo: string): Date {
    if (valor instanceof Date) return valor;
    const partes = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(valor ?? "").trim());
    if (!partes) throw new AppError(`El campo ${campo} debe tener formato HH:MM`);
    return new Date(Date.UTC(
        1970, 0, 1,
        Number(partes[1]), Number(partes[2]), Number(partes[3] ?? 0)
    ));
}


// las fechas van como YYYY-MM-DD, un ISO con hora puede correr el dia
export function normalizarFecha(fecha: Date | string): Date {
    if (typeof fecha === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(fecha.trim())) {
        throw new AppError("La fecha debe tener formato YYYY-MM-DD");
    }
    const valor = fecha instanceof Date ? fecha : new Date(`${fecha.trim()}T00:00:00.000Z`);

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
