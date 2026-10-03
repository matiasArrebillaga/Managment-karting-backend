export interface IInscripcion {
    Torneos_idTorneos: number;
    Personas_idPersona: number;
    fecha_inscripcion: Date;
    hora_inscripcion: Date;
}

// Lo que llega por la request. La fecha y la hora no estan: las pone el servidor con su
// propio reloj, no el cliente. Para un CLIENTE el Personas_idPersona tambien se ignora.
export type CreatePersonaTorneo = Pick<
    IInscripcion,
    "Torneos_idTorneos" | "Personas_idPersona"
>;
