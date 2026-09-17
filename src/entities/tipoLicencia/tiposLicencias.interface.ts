export interface ITiposLicencias {
    idTipoLicencias?: number;
    nombre: string;
    descripcion: string;
    nivel: number;
}

export type CreateTiposLicencias = Omit<ITiposLicencias, "idTipoLicencias">;
export type UpdateTiposLicencias = Partial<CreateTiposLicencias>;