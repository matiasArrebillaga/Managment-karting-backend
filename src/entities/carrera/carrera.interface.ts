
export interface ICarrera {
    fechaCarrera: Date;
    horaInicio: Date;
    horaFin: Date;
    Kartings_idKartings: number;
    Torneos_idTorneos: number;
    Circuitos_idCircuitos: number;
}

export type CreateCarrera = ICarrera;

export type UpdateCarrera = Partial<Pick<ICarrera, "horaInicio" | "horaFin">>;

