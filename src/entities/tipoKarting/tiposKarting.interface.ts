export interface ITiposKartings {
    idTipoKarting?: number;
    nombre: string;
    descripcion: string;
    TiposLicencias_idTipoLicenciaMinima: number;
}

export type CreateTiposKartings = Omit<ITiposKartings, "idTipoKarting">;
export type UpdateTiposKartings = Partial<CreateTiposKartings>;