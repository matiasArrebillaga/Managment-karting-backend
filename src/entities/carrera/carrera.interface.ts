
export interface ICarrera {
    fechaCarrera: Date;
    horaInicio: Date;
    horaFin: Date;
    Kartings_idKartings: number;
    Torneos_idTorneos: number;
    Circuitos_idCircuitos: number;
}

export type CreateCarrera = Omit<ICarrera, "horaInicio" | "horaFin"> & {
    horaInicio: Date | string;
    horaFin: Date | string;
};

export type UpdateCarrera = Partial<Pick<ICarrera, "horaInicio" | "horaFin">> & {
    horaInicio?: Date | string;
    horaFin?: Date | string;
};

