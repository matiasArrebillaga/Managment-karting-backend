export interface ILoginDTO {
    mail: string;
    contraseña:string;
}

export interface IRegisterDTO{
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    mail: string;
    telefono: string;
    contraseña: string;
    Localidades_idLocalidades: number;
}