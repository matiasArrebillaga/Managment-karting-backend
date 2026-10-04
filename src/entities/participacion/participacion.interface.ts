
export interface IParticipacion {
    Carrera_Kartings_idKartings: number;
    Carrera_Torneos_idTorneos: number;
    Carrera_Circuitos_idCircuitos: number;
    Carrera_fecha: Date;
    Personas_idPersona: number;
    puntos: number;
    tiempo: string;
    posicion_final: number;
}

export type ClavesCarrera = Pick<
    IParticipacion,
    "Carrera_Kartings_idKartings" | "Carrera_Torneos_idTorneos" | "Carrera_Circuitos_idCircuitos" | "Carrera_fecha"
>;

// Una fila de la clasificacion: los puntos no entran, los calcula el servidor por la posicion
export type ResultadoCarrera = Pick<IParticipacion, "Personas_idPersona" | "posicion_final" | "tiempo">;

export type CreateParticipacion = ClavesCarrera & ResultadoCarrera;

export type UpdateParticipacion = Partial<Pick<IParticipacion, "tiempo" | "posicion_final">>;
