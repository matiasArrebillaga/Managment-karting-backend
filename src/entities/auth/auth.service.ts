import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {prisma} from "../../config/prisma"
import {IRegisterDTO, ILoginDTO } from "./auth.interface"
import personaService from "../persona/persona.service"
// service de auth aca es la diferencia con un crud simple
const JWT_SECRET = process.env.JWT_SECRET as string; // clave de entorno
const JWT_EXPIRES_IN = "1d";// tiempo en el que expira el token 

class AuthService {

    async register(data: IRegisterDTO) {
        const fechaNacimiento = new Date(data.fechaNacimiento); // transforma la data en fecha

        if (Number.isNaN(fechaNacimiento.getTime())) { // valida que sea un numero valido
            throw new Error("La fecha de nacimiento no es válida");
        }
        // llama al service create de persona con los datos
        return personaService.create({
            ...data,
            fechaNacimiento
        });
    }
// logica del login y manejo de tokens
async login(data: ILoginDTO) {
// primero busca a la persona por mail e incluye el rol
    const persona = await prisma.personas.findFirst({
        where: { mail: data.mail },
        include: {
            rol: true
        }
    });

    if (!persona) {
        throw new Error("Credenciales invalidas");
    }
    // valida el hash de la contraseña ingresada con bycrypt 
    const contraseñaValida = await bcrypt.compare(
        data.contraseña,
        persona.contraseña
    );

    if (!contraseñaValida) {
        throw new Error("Credenciales invalidas");
    }
    // una vez validada la contraseña se crea y firma el token con el rol y los datos de la persona    
    const token = jwt.sign(
        {
            idPersona: persona.idPersona,
            mail: persona.mail,
            rol: persona.rol.nombre
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const { contraseña, ...personaSinContraseña } = persona; // extrae los datos sin la contraseña

    return {
        token,
        persona: personaSinContraseña // devuelve el token y los datos 
    };
}
}
export default new AuthService();