-- AlterTable
ALTER TABLE `torneos` ADD COLUMN `TiposLicencias_idTipoLicencia` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `fk_Torneos_TiposLicencias_idx` ON `torneos`(`TiposLicencias_idTipoLicencia`);

-- AddForeignKey
ALTER TABLE `torneos` ADD CONSTRAINT `fk_Torneos_TiposLicencias` FOREIGN KEY (`TiposLicencias_idTipoLicencia`) REFERENCES `tiposlicencias`(`idTipoLicencia`) ON DELETE NO ACTION ON UPDATE NO ACTION;
