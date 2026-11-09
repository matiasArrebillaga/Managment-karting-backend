// el monto lo calcula el service con el precio por hora y la duracion
export interface IReserva {
    idReservas ?: number;
    fechaReserva : Date;
    horaInicio : Date;
    horaFin : Date;
    Personas_idPersona : number ;
    Circuitos_idCircuitos : number;
    Kartings_idKartings : number;
}

export type CreateReserva = Omit<IReserva,"idReservas">;
export type UpdateReserva = Partial<CreateReserva>;

// lo que llega de la request, el service lo pasa a Date
export type CreateReservaInput = {
    fechaReserva: Date | string;
    horaInicio: Date | string;
    horaFin: Date | string;
    Personas_idPersona: number;
    Circuitos_idCircuitos: number;
    Kartings_idKartings: number;
};
export type UpdateReservaInput = Partial<CreateReservaInput>;
