import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../middleware/error.middleware";

// la persona necesita una licencia de nivel igual o mayor al pedido, vigente en la fecha
// indicada (reservas e inscripciones). vigenteAl es un DATE a medianoche UTC, igual que
// fechaVencimiento: una licencia que vence ese mismo dia todavia cuenta
export async function validarLicenciaVigente(
    db: Prisma.TransactionClient,
    Personas_idPersona: number,
    nivelRequerido: number,
    vigenteAl: Date,
    para: string // "para el karting", "para el torneo": completa el mensaje de error
) {
    const licenciaValida = await db.licencias.findFirst({
        where: {
            Personas_idPersona,
            fechaVencimiento: { gte: vigenteAl },
            tiposlicencias: { nivel: { gte: nivelRequerido } }
        }
    });
    if (!licenciaValida) {
        throw new AppError(`La persona no cuenta con una licencia de nivel suficiente ${para}`);
    }
}
