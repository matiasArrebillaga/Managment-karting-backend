export interface ITiposLicencias 
{ 
idTipoLicencias?: number;
nombre: string; 
descripcion: string; }

export type CreateTiposLicencias = Omit<ITiposLicencias, "idTipoLicencias">;
export type UpdateTiposLicencias = Partial<CreateTiposLicencias>;