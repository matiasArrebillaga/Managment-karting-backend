export interface ILicencia {
    idLicencias:number;
    fechaEmision : string;
    fechaVencimiento : string;
    Personas_idPersona : number;
    TiposLicencias_idTipoLicencia : number;

}

export type CreateLicencia = Omit<ILicencia , "idLicencias">;
export type UpdateLicencia = Partial<ILicencia>;