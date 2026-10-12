-- Una carrera pasa a tener varios karts: el kart sale de la clave de carreras
-- (y de participaciones, que la referencia) y va a la tabla carreras_kartings.
-- Si hubiera dos filas de la misma carrera con distinto kart, el ADD PRIMARY KEY falla:
-- hay que unificarlas a mano antes de migrar.

-- CreateTable
CREATE TABLE `carreras_kartings` (
    `Carrera_Torneos_idTorneos` INTEGER NOT NULL,
    `Carrera_Circuitos_idCircuitos` INTEGER NOT NULL,
    `Carrera_fecha` DATE NOT NULL,
    `Kartings_idKartings` INTEGER NOT NULL,

    INDEX `fk_CarreraKarting_Kartings_idx`(`Kartings_idKartings`),
    PRIMARY KEY (`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`, `Kartings_idKartings`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Copia el kart que ya tenia cada carrera antes de borrar la columna
INSERT INTO `carreras_kartings` (`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`, `Kartings_idKartings`)
SELECT `Torneos_idTorneos`, `Circuitos_idCircuitos`, `fechaCarrera`, `Kartings_idKartings` FROM `carreras`;

-- DropForeignKey
ALTER TABLE `carreras` DROP FOREIGN KEY `fk_Carrera_Kartings1`;

-- DropForeignKey
ALTER TABLE `participaciones` DROP FOREIGN KEY `fk_Carrera_has_Personas_Carrera1`;

-- DropIndex
DROP INDEX `fk_Carrera_Kartings1_idx` ON `carreras`;

-- DropIndex
DROP INDEX `fk_Carrera_has_Personas_Carrera1_idx` ON `participaciones`;

-- DropIndex
DROP INDEX `uq_participacion_posicion` ON `participaciones`;

-- AlterTable
ALTER TABLE `carreras` DROP PRIMARY KEY,
    DROP COLUMN `Kartings_idKartings`,
    ADD PRIMARY KEY (`Torneos_idTorneos`, `Circuitos_idCircuitos`, `fechaCarrera`);

-- AlterTable
ALTER TABLE `participaciones` DROP PRIMARY KEY,
    DROP COLUMN `Carrera_Kartings_idKartings`,
    ADD PRIMARY KEY (`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`, `Personas_idPersona`);

-- CreateIndex
CREATE INDEX `fk_Carrera_has_Personas_Carrera1_idx` ON `participaciones`(`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`);

-- CreateIndex
CREATE UNIQUE INDEX `uq_participacion_posicion` ON `participaciones`(`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`, `posicion_final`);

-- AddForeignKey
ALTER TABLE `carreras_kartings` ADD CONSTRAINT `fk_CarreraKarting_Carrera` FOREIGN KEY (`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`) REFERENCES `carreras`(`Torneos_idTorneos`, `Circuitos_idCircuitos`, `fechaCarrera`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `carreras_kartings` ADD CONSTRAINT `fk_CarreraKarting_Kartings` FOREIGN KEY (`Kartings_idKartings`) REFERENCES `kartings`(`idKartings`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participaciones` ADD CONSTRAINT `fk_Carrera_has_Personas_Carrera1` FOREIGN KEY (`Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`) REFERENCES `carreras`(`Torneos_idTorneos`, `Circuitos_idCircuitos`, `fechaCarrera`) ON DELETE NO ACTION ON UPDATE NO ACTION;
