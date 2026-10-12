
export interface ICarrera {
    fechaCarrera: Date;
    horaInicio: Date;
    horaFin: Date;
    Torneos_idTorneos: number;
    Circuitos_idCircuitos: number;
}

// kartings: ids de los karts que corren la carrera
export type CreateCarrera = Omit<ICarrera, "horaInicio" | "horaFin"> & {
    horaInicio: Date | string;
    horaFin: Date | string;
    kartings: number[];
};

// si viene kartings reemplaza la lista completa
export type UpdateCarrera = {
    horaInicio?: Date | string;
    horaFin?: Date | string;
    kartings?: number[];
};
