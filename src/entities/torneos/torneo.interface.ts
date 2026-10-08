export interface ITorneos {
    idTorneos?: number;
    nombre: string;
    descripcion: string;
    cupoMaximo: number;
    fechaInicio: Date;
    fechaFin: Date;
}

// las fechas pueden llegar como string desde el body, el service las convierte
export type CreateTorneos = Omit<ITorneos, "idTorneos" | "fechaInicio" | "fechaFin"> & {
    fechaInicio: string | Date;
    fechaFin: string | Date;
};
export type UpdateTorneos = Partial<CreateTorneos>;