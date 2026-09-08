
export interface IParticipacion {
    Carrera_Kartings_idKartings: number;
    Carrera_Torneos_idTorneos: number;
    Carrera_Circuitos_idCircuitos: number;
    Carrera_fecha: Date;
    Personas_idPersona: number;
    puntos: number;
    tiempo: string;
    posicion_final: string;
}

export type CreateParticipacion = IParticipacion;

export type UpdateParticipacion = Partial<
    Pick<IParticipacion, "puntos" | "tiempo" | "posicion_final">
>;
