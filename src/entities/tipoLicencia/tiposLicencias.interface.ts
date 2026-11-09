export interface ITiposLicencias {
    idTipoLicencia?: number;
    nombre: string;
    descripcion: string;
    nivel: number;
}

export type CreateTiposLicencias = Omit<ITiposLicencias, "idTipoLicencia">;
export type UpdateTiposLicencias = Partial<CreateTiposLicencias>;