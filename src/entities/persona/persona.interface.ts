export interface IPersona {
    idPersona: number;
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    mail: string;
    telefono: string
    Localidades_idLocalidades?: number;
}