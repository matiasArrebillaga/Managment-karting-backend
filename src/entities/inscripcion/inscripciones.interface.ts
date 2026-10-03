export interface IInscripcion {
    Torneos_idTorneos: number;
    Personas_idPersona: number;
    fecha_inscripcion: Date;
    hora_inscripcion: Date;
}


// subconjunto de inscripcion para personaTorneo
export type CreatePersonaTorneo = Pick<
    IInscripcion,
    "Torneos_idTorneos" | "Personas_idPersona"
>;
