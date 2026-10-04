export interface ILocalidad {
    idLocalidades: number;
    nombre: string;
}
// interfaz para facilitar la creacion y actualizacion de localidades
export type CreateLocalidad = Omit<ILocalidad, "idLocalidades">;//omite el id porque es incremental
export type UpdateLocalidad = Partial<CreateLocalidad>;//hace que la informacion sea parcial