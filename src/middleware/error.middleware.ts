import { Request, Response, NextFunction } from "express";


export class AppError extends Error { // crea una subclase de Error de JS
    statusCode: number;

    constructor(message: string, statusCode: number = 400) { //la base para mostrar el error personalizado
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}

// maneja el error si se hace una request a una ruta que no existe
export function notFoundHandler(req: Request, res: Response) { 
    res.status(404).json({
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
}

// funcion de manejo unificado de errores
// err es unknown para recibir cualquier tipo de error
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    if (err instanceof AppError) { // si es un error personalizado 
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
// transforma los errores de la base de datos y envia el status correspondiente
    if (typeof err === "object" && err !== null && "code" in err) {
        const code = (err as { code?: string }).code;
        if (code === "P2025") {
            return res.status(404).json({
                message: "Recurso no encontrado"
            });
        }
        if (code === "P2002") {
            return res.status(409).json({
                message: "El recurso ya existe"
            });
        }
    }
// si el error es de JavaScript 
    if (err instanceof Error) {
        return res.status(400).json({
            message: err.message
        });
    }
// si no se reconoce el error da un error generico
    res.status(500).json({
        message: "Error interno del servidor"
    });
}