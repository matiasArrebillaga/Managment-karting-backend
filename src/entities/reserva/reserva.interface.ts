// El monto no forma parte de la entrada: lo calcula el service a partir del
// precio por hora del tipo de karting y la duracion de la franja reservada.
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

// Lo que llega por la request: las horas vienen como "HH:MM" y la fecha como texto.
// El service las normaliza a Date antes de validar.
export type CreateReservaInput = {
    fechaReserva: Date | string;
    horaInicio: Date | string;
    horaFin: Date | string;
    Personas_idPersona: number;
    Circuitos_idCircuitos: number;
    Kartings_idKartings: number;
};
export type UpdateReservaInput = Partial<CreateReservaInput>;
