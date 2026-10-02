// interfaces de login y register, register es la encargada de crear personas
export interface ILoginDTO {
    mail: string;
    contraseña:string;
}

export interface IRegisterDTO{
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: string | Date;
    mail: string;
    telefono: string;
    contraseña: string;
    Localidades_idLocalidades: number;
    idRol: number;
}