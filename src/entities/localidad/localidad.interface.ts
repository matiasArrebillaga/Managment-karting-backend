export interface ILocalidad {
    idLocalidades: number;
    nombre: string;
}

export type CreateLocalidad = Omit<ILocalidad, "idLocalidades">;
export type UpdateLocalidad = Partial<CreateLocalidad>;