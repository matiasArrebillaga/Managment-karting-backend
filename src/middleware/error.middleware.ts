import { Request, Response, NextFunction } from "express";


export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
}


export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

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

    if (err instanceof Error) {
        return res.status(400).json({
            message: err.message
        });
    }

    res.status(500).json({
        message: "Error interno del servidor"
    });
}