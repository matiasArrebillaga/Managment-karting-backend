export interface IPersona {
    idPersona: number;
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    mail: string;
    telefono: string;
    Localidades_idLocalidades: number;
    idRol: number;
}

export type CreatePersona = Omit<IPersona, "idPersona"> & {
    contraseña: string;
};
export type UpdatePersona = Partial<CreatePersona>;