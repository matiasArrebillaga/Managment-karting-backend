export interface IReserva {
    idReservas ?: number;
    fechaReserva : Date;
    monto : number;
    Personas_idPersona : number ;
    Circuitos_idCircuitos : number;
    Kartings_idKartings : number;
}

export type CreateReserva = Omit<IReserva,"idReserva">;
export type UpdateReserva = Partial<IReserva>;