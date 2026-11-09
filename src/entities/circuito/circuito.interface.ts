export interface ICircuito {
    idCircuitos: number;
    distancia: number;
    dificultad: string;
    maximo: number;
}

export type CreateCircuito = Omit<ICircuito, "idCircuitos">;
export type UpdateCircuito = Partial<CreateCircuito>;