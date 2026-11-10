import { AppError } from "../middleware/error.middleware";

export function validarId(id: number) {
    if (!Number.isInteger(id)) throw new AppError("El identificador debe ser un número entero");
}

// convierte "3" en 3, "" y "abc" quedan asi el service los rechaza
export function aNumeros<T extends object>(body: T, ...campos: string[]): T {
    const copia = { ...body } as Record<string, unknown>;
    for (const campo of campos) {
        const valor = copia[campo];
        if (typeof valor === "string" && valor.trim() !== "" && Number.isFinite(Number(valor))) {
            copia[campo] = Number(valor);
        }
    }
    return copia as T;
}
