export interface IInscripcion {
    Torneos_idTorneos: number;
    Personas_idPersona: number;
    fecha_inscipcion: Date;
    hora_inscripcion: Date;
}

export type CreatePersonaTorneo = IInscripcion;

export type UpdatePersonaTorneo = Partial<
    Pick<IInscripcion, "fecha_inscipcion" | "hora_inscripcion">
>;