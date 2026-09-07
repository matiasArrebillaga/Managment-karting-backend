export interface ITiposKartings { idTipoKarting?: number; nombre: string; descripcion: string; }

export type CreateTiposKartings = Omit<ITiposKartings, "idTipoKarting">;
export type UpdateTiposKartings = Partial<CreateTiposKartings>;