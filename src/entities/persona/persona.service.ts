import { AppError } from "../../middleware/error.middleware";
import {prisma} from "../../config/prisma"
import { IPersona, UpdatePersona , CreatePersona } from "./persona.interface"
import bcrypt from "bcryptjs";

class PersonaService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new AppError("El identificador debe ser un número entero");
    }
    private validarDatos(data: CreatePersona | UpdatePersona) {
        for (const campo of ["nombre", "apellido", "dni", "mail", "telefono"] as const) {
            const valor = data[campo];
            if (valor !== undefined && (typeof valor !== "string" || valor.trim().length === 0 || valor.trim().length > 45)) {
                throw new AppError(`El campo ${campo} debe ser un texto de entre 1 y 45 caracteres`);
            }
        }
        // algo@algo.algo, sin espacios
        if (data.mail !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.mail.trim())) {
            throw new AppError("El mail no tiene un formato válido");
        }
        if (data.contraseña !== undefined && (typeof data.contraseña !== "string" || data.contraseña.length < 8 || data.contraseña.length > 255)) {
            throw new AppError("La contraseña debe tener entre 8 y 255 caracteres");
        }
        if (data.fechaNacimiento !== undefined) {
            const fecha = new Date(data.fechaNacimiento);
            if (Number.isNaN(fecha.getTime())) throw new AppError("La fecha de nacimiento no es válida");
            if (fecha > new Date()) throw new AppError("La fecha de nacimiento no puede ser futura");
        }
        for (const campo of ["Localidades_idLocalidades"] as const) {
            if (data[campo] !== undefined && !Number.isInteger(data[campo])) {
                throw new AppError(`El campo ${campo} debe ser un identificador entero`);
            }
        }
    }
   async create(data: CreatePersona) {
    return this.crearPersonaConRol(data, "CLIENTE");
}

async crearEmpleado(data: CreatePersona) {
    return this.crearPersonaConRol(data, "EMPLEADO");
}

private async crearPersonaConRol(
    data: CreatePersona,
    nombreRol: string
) {
    this.validarDatos(data);

    const mail = data.mail.trim();

    const personaExistente = await prisma.personas.findFirst({
        where: { mail }
    });

    if (personaExistente) {
        throw new AppError("El mail ya está registrado");
    }

    const localidad = await prisma.localidades.findUnique({
        where: {
            idLocalidades: data.Localidades_idLocalidades
        }
    });

    if (!localidad) {
        throw new AppError("La localidad ingresada no existe");
    }

    const rol = await prisma.roles.findFirst({
        where: { nombre: nombreRol }
    });

    //Esto podria no estar , si estamos pasando un parametro fijo con ese nombre es porque el rol ya esta definido desde antes
    if (!rol) {
        throw new AppError(`El rol ${nombreRol} no existe`);
    }

    const fechaNacimiento = new Date(data.fechaNacimiento);

    if (Number.isNaN(fechaNacimiento.getTime())) {
        throw new AppError("La fecha de nacimiento no es válida");
    }

    const contraseñaHasheada = await bcrypt.hash(
        data.contraseña,
        10
    );

    const persona = await prisma.personas.create({
        data: {
            ...data,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            dni: data.dni.trim(),
            mail,
            telefono: data.telefono.trim(),
            fechaNacimiento,
            contraseña: contraseñaHasheada,
            idRol: rol.idRol
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
        this.validarId(idPersona);
        return await prisma.personas.findUnique({
            where: {idPersona},
            omit: {contraseña: true}
        });
    }

    async update(idPersona:number,data:UpdatePersona){
        this.validarId(idPersona);
        this.validarDatos(data);
        if (data.mail !== undefined) {
            const existente = await prisma.personas.findFirst({ where: { mail: data.mail.trim(), NOT: { idPersona } } });
            if (existente) throw new AppError("El mail ya está registrado");
        }
        if (data.Localidades_idLocalidades !== undefined &&
            !await prisma.localidades.findUnique({where: {idLocalidades: data.Localidades_idLocalidades}})) {
            throw new AppError("La localidad ingresada no existe");
        }
        return await prisma.personas.update({
            where: {idPersona},
            data: {
                ...data,
                ...(data.nombre === undefined ? {} : {nombre: data.nombre.trim()}),
                ...(data.apellido === undefined ? {} : {apellido: data.apellido.trim()}),
                ...(data.dni === undefined ? {} : {dni: data.dni.trim()}),
                ...(data.mail === undefined ? {} : {mail: data.mail.trim()}),
                ...(data.telefono === undefined ? {} : {telefono: data.telefono.trim()}),
                ...(data.fechaNacimiento === undefined ? {} : {fechaNacimiento: new Date(data.fechaNacimiento)}),
                ...(data.contraseña === undefined ? {} : {contraseña: await bcrypt.hash(data.contraseña, 10)})
            },
            omit: {contraseña: true}
        });
    }
    async delete(idPersona:number){
        this.validarId(idPersona);
        return await prisma.personas.delete({
            where:{idPersona}
        });
    }

    // Asignar un rol a una persona (update tira P2025 -> 404 si la persona no existe)
    async asignarRol(idPersona: number, nombreRol: string) {
        this.validarId(idPersona);
        // sin esto un nombreRol undefined hace que findFirst ignore el filtro y devuelva el primer rol
        if (typeof nombreRol !== "string" || nombreRol.trim() === "") throw new AppError("nombreRol es obligatorio");
        const rol = await prisma.roles.findFirst({ where: { nombre: nombreRol.trim() } });
        if (!rol) throw new AppError(`El rol ${nombreRol} no existe`);
        return await prisma.personas.update({
            where: { idPersona },
            data: { idRol: rol.idRol },
            omit: { contraseña: true }
        });
    }
}
export default new PersonaService();