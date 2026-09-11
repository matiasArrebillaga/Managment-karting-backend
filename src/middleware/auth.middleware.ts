
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    user?: {
        idPersona: number;
        mail: string;
        rol: string;
    };
}

export function verifyToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Token no proporcionado"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            idPersona: number;
            mail: string;
            rol: string;
        };

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({
            message: "Token inválido o expirado"
        });
    }
}

export function verifyRoles(...rolesPermitidos: string[]) {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado"
            });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                message: "No tenés permisos para acceder a esta ruta"
            });
        }

        next();
    };
}
