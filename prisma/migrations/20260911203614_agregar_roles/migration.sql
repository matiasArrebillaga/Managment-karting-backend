/*
  Warnings:

  - Added the required column `idRol` to the `personas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `personas` ADD COLUMN `idRol` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `roles` (
    `idRol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`idRol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fk_Personas_Roles_idx` ON `personas`(`idRol`);

-- AddForeignKey
ALTER TABLE `personas` ADD CONSTRAINT `personas_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `roles`(`idRol`) ON DELETE RESTRICT ON UPDATE CASCADE;
