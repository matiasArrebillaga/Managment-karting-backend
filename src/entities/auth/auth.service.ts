import { AppError } from "../../middleware/error.middleware";
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
            throw new AppError("La fecha de nacimiento no es válida");
        }
        // llama al service create de persona con los datos
        return personaService.create({
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            fechaNacimiento,
            mail: data.mail,
            telefono: data.telefono,
            Localidades_idLocalidades: data.Localidades_idLocalidades,
            contraseña: data.contraseña
        });
    }
// logica del login y manejo de tokens
async login(data: ILoginDTO) {
// primero busca a la persona por mail e incluye el rol
    // mail es @unique: findUnique trae a la unica persona con ese mail
    const persona = await prisma.personas.findUnique({
        where: { mail: String(data.mail ?? "").trim().toLowerCase() },
        include: {
            rol: true
        }
    });

    if (!persona) {
        throw new AppError("Credenciales invalidas", 401);
    }
    // valida el hash de la contraseña ingresada con bycrypt 
    const contraseñaValida = await bcrypt.compare(
        data.contraseña,
        persona.contraseña
    );

    if (!contraseñaValida) {
        throw new AppError("Credenciales invalidas", 401);
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