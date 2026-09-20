export interface ITorneos {
    idTorneos?: number;
    nombre: string;
    descripcion: string;
    cupoMaximo: number;
    fechaInicio: Date;
    fechaFin: Date;
}

export type CreateTorneos = Omit<ITorneos, "idTorneos">;
export type UpdateTorneos = Partial<CreateTorneos>;