export interface ITiposKartings {
    idTiposKarting?: number;
    nombre: string;
    descripcion: string;
    precioHora: number;
    TiposLicencias_idTipoLicenciaMinima: number;
}

export type CreateTiposKartings = Omit<ITiposKartings, "idTiposKarting">;
export type UpdateTiposKartings = Partial<CreateTiposKartings>;