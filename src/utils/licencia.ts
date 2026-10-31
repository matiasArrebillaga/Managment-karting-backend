import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../middleware/error.middleware";

// la persona necesita una licencia vigente de nivel igual o mayor al pedido (reservas e inscripciones)
export async function validarLicenciaVigente(
    db: Prisma.TransactionClient,
    Personas_idPersona: number,
    nivelRequerido: number,
    para: string // "para el karting", "para el torneo": completa el mensaje de error
) {
    const licenciaValida = await db.licencias.findFirst({
        where: {
            Personas_idPersona,
            fechaVencimiento: { gte: new Date() },
            tiposlicencias: { nivel: { gte: nivelRequerido } }
        }
    });
    if (!licenciaValida) {
        throw new AppError(`La persona no cuenta con una licencia de nivel suficiente ${para}`);
    }
}
