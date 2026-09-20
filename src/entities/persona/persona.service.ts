import {prisma} from "../../config/prisma"
import { IPersona, UpdatePersona , CreatePersona } from "./persona.interface"
import bcrypt from "bcryptjs";

class PersonaService {
    async create(data: CreatePersona) {
        const personaExistente = await prisma.personas.findFirst({
            where: { mail: data.mail }
        });

        if (personaExistente) {
            throw new Error("El mail ya está registrado");
        }

        const localidad = await prisma.localidades.findUnique({
            where: {
                idLocalidades: data.Localidades_idLocalidades
            }
        });

        if (!localidad) {
            throw new Error("La localidad ingresada no existe");
        }

        const rol = await prisma.roles.findUnique({
            where: {
                idRol: data.idRol
            }
        });

        if (!rol) {
            throw new Error("El rol ingresado no existe");
        }

        const fechaNacimiento = new Date(data.fechaNacimiento);

        if (Number.isNaN(fechaNacimiento.getTime())) {
            throw new Error("La fecha de nacimiento no es válida");
        }

        const contraseñaHasheada = await bcrypt.hash(data.contraseña, 10);

        const persona = await prisma.personas.create({
            data: {
                ...data,
                fechaNacimiento,
                contraseña: contraseñaHasheada
            }
        });

        const { contraseña, ...personaSinContraseña } = persona;
        return personaSinContraseña;
    }

    async getAll(){
        return await prisma.personas.findMany({
            omit: { contraseña: true }
        });
    }
    async getById(idPersona:number){
        return await prisma.personas.findUnique({
            where: {idPersona},
            omit: {contraseña: true}
        });
    }

    async update(idPersona:number,data:UpdatePersona){
        return await prisma.personas.update({
            where: {idPersona},
            data
        });
    }
    async delete(idPersona:number){
        return await prisma.personas.delete({
            where:{idPersona}
        });
    }
}
export default new PersonaService();