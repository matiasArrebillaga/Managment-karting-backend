export interface IPersonaTorneo {
    Torneos_idTorneos: number;
    Personas_idPersona: number;
    fecha_inscipcion: Date;
    hora_inscripcion: Date;
}

export type CreatePersonaTorneo = IPersonaTorneo;

export type UpdatePersonaTorneo = Partial<
    Pick<IPersonaTorneo, "fecha_inscipcion" | "hora_inscripcion">
>;