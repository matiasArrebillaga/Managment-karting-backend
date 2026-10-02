
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string; // define la contraseña en las variables de .env

export interface AuthRequest extends Request { // interfaz que extiende y define las propiedades de el req.user 
    user?: {
        idPersona: number;
        mail: string;
        rol: string;
    };
}
// funcion que verifica el token antes de poder entrar en la ruta
export function verifyToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization; // extrae el token que viene de la request desde "Bearer"

    if (!authHeader || !authHeader.startsWith("Bearer ")) { // valida que tenga el token y que venga del esquema de portador
        return res.status(401).json({
            message: "Token no proporcionado"
        });
    }

    const token = authHeader.split(" ")[1]; // extrae el token 

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { // verifica el token junto con la clave del entorno
            idPersona: number;
            mail: string;
            rol: string;
        };

        req.user = decoded;

        next(); // continua con la request en la ruta

    } catch (error) { // si hay errores lo maneja y cancela la request
        return res.status(403).json({
            message: "Token inválido o expirado"
        });
    }
}
// funcion principal para verificar los roles, se usa en la ruta de cada entidad
export function verifyRoles(...rolesPermitidos: string[]) {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {

        if (!req.user) { // verifica que tenga un token valido ya autenticado por verifyToken
            return res.status(401).json({
                message: "Usuario no autenticado"
            });
        }
        // valida el rol del usuario con el parametro ingresado en la llamada de la funcion
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                message: "No tenés permisos para acceder a esta ruta"
            });
        }

        next(); // continua con la request
    };
}
