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

// middleware de ruta: corta con 400 si al body le falta algun campo obligatorio
// asi el service nunca recibe un body vacio (ej: "Cannot read properties of undefined")
export function requireFields(...campos: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const body = req.body ?? {};
        const faltantes = campos.filter(campo => body[campo] === undefined || body[campo] === null || body[campo] === "");
        if (faltantes.length > 0) {
            return next(new AppError(`Faltan campos obligatorios: ${faltantes.join(", ")}`));
        }
        next();
    };
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
        if (code === "P2003") { // clave foranea: el id referenciado no existe o el registro esta en uso
            return res.status(409).json({
                message: "El recurso referenciado no existe o está en uso"
            });
        }
    }
// cualquier otro error (de JavaScript, de Prisma, etc.) es un fallo nuestro:
// no se expone el mensaje interno, queda solo en el console.error de arriba
    res.status(500).json({
        message: "Error interno del servidor"
    });
}
