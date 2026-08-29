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
    const contraseñaHasheada= await bcrypt.hash(data.contraseña,10)
    const nuevaPersona = await prisma.personas.create({
        data: {
            ...data,
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