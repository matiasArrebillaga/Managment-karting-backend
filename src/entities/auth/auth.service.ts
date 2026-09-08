import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {prisma} from "../../config/prisma"
import {IRegisterDTO, ILoginDTO } from "./auth.interface"

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "1d";

class AuthService {
    async register (data:IRegisterDTO){
        const personaExistente = await prisma.personas.findFirst({
            where: {mail:data.mail}
        });
    if (personaExistente){
        throw new Error ("El mail ya esta registrado");
    }

    const fechaNacimiento = new Date(data.fechaNacimiento);
    if (Number.isNaN(fechaNacimiento.getTime())) {
        throw new Error("La fecha de nacimiento no es válida");
    }

    const contraseñaHasheada= await bcrypt.hash(data.contraseña,10)
    const nuevaPersona = await prisma.personas.create({
        data: {
            ...data,
            fechaNacimiento,
            contraseña: contraseñaHasheada
        }
    });
    const {contraseña, ...personaSinPassword}= nuevaPersona;
    return personaSinPassword;
    }
    
    async login (data: ILoginDTO){
        const persona = await prisma.personas.findFirst({
            where: {mail: data.mail}
        });
        if (!persona){
            throw new Error ("Credenciales invalidas");
        }
        const contraseñaValida = await bcrypt.compare(data.contraseña,persona.contraseña);
        if (!contraseñaValida){
            throw new Error ("Credenciales invalidas");
        }
        const token = jwt.sign(
            {idPersona: persona.idPersona, mail: persona.mail},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRES_IN}
        );
        const {contraseña, ...personaSinContraseña} = persona;
        return {token,persona: personaSinContraseña};
    }
}
export default new AuthService();