import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../middleware/error.middleware";

// licencia de nivel igual o mayor, vigente en la fecha
// si vence ese mismo dia todavia cuenta
export async function validarLicenciaVigente(
    db: Prisma.TransactionClient,
    Personas_idPersona: number,
    nivelRequerido: number,
    vigenteAl: Date,
    para: string // completa el mensaje de error
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
