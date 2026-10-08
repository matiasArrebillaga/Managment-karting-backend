import {prisma} from "../../config/prisma"
import { IPersona, UpdatePersona , CreatePersona } from "./persona.interface"
import bcrypt from "bcryptjs";

class PersonaService {
    private validarId(id: number) {
        if (!Number.isInteger(id)) throw new Error("El identificador debe ser un número entero");
    }
    private validarDatos(data: CreatePersona | UpdatePersona) {
        for (const campo of ["nombre", "apellido", "dni", "mail", "telefono"] as const) {
            const valor = data[campo];
            if (valor !== undefined && (typeof valor !== "string" || valor.trim().length === 0 || valor.trim().length > 45)) {
                throw new Error(`El campo ${campo} debe ser un texto de entre 1 y 45 caracteres`);
            }
        }
        if (data.contraseña !== undefined && (typeof data.contraseña !== "string" || data.contraseña.length === 0 || data.contraseña.length > 255)) {
            throw new Error("La contraseña debe tener entre 1 y 255 caracteres");
        }
        if (data.fechaNacimiento !== undefined) {
            const fecha = new Date(data.fechaNacimiento);
            if (Number.isNaN(fecha.getTime())) throw new Error("La fecha de nacimiento no es válida");
            if (fecha > new Date()) throw new Error("La fecha de nacimiento no puede ser futura");
        }
        for (const campo of ["Localidades_idLocalidades"] as const) {
            if (data[campo] !== undefined && !Number.isInteger(data[campo])) {
                throw new Error(`El campo ${campo} debe ser un identificador entero`);
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

    const rol = await prisma.roles.findFirst({
        where: { nombre: nombreRol }
    });

    //Esto podria no estar , si estamos pasando un parametro fijo con ese nombre es porque el rol ya esta definido desde antes
    if (!rol) {
        throw new Error(`El rol ${nombreRol} no existe`);
    }

    const fechaNacimiento = new Date(data.fechaNacimiento);

    if (Number.isNaN(fechaNacimiento.getTime())) {
        throw new Error("La fecha de nacimiento no es válida");
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
            if (existente) throw new Error("El mail ya está registrado");
        }
        if (data.Localidades_idLocalidades !== undefined &&
            !await prisma.localidades.findUnique({where: {idLocalidades: data.Localidades_idLocalidades}})) {
            throw new Error("La localidad ingresada no existe");
        }
        // if (data.idRol !== undefined &&
        //     !await prisma.roles.findUnique({where: {idRol: data.idRol}})) {
        //     throw new Error("El rol ingresado no existe");
        // }
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
            }
        });
    }
    async delete(idPersona:number){
        this.validarId(idPersona);
        return await prisma.personas.delete({
            where:{idPersona}
        });
    }

    //Asignar un rol a una persona 
    async asignarRol(idPersona : number , nombreRol : string){
        this.validarId(idPersona);
        const persona = await prisma.personas.findUniqueOrThrow({
            where : {idPersona}
        })
        const rol = await prisma.roles.findFirst({
            where : {nombre:nombreRol}
        })
       
    if(rol == null){
        throw new Error("El rol no puede ser nulo");
    }
    return await prisma.personas.update({
        where : {idPersona},
        data: {
            idRol : rol.idRol
        }});
    }
}
export default new PersonaService();