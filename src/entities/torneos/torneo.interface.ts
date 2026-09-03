export interface ITorneos { idTorneo?: number; nombre: string; descripcion: string; fechaInicio: Date; fechaFin: Date; }

export type CreateTorneos = Omit<ITorneos, "idTorneo">;
export type UpdateTorneos = Partial<CreateTorneos>;