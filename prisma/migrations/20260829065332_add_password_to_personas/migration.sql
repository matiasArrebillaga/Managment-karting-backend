-- CreateTable
CREATE TABLE `carreras` (
    `fechaCarrera` DATE NOT NULL,
    `horaInicio` TIME(0) NOT NULL,
    `horaFin` TIME(0) NOT NULL,
    `Kartings_idKartings` INTEGER NOT NULL,
    `Torneos_idTorneos` INTEGER NOT NULL,
    `Circuitos_idCircuitos` INTEGER NOT NULL,

    INDEX `fk_Carrera_Circuitos1_idx`(`Circuitos_idCircuitos`),
    INDEX `fk_Carrera_Kartings1_idx`(`Kartings_idKartings`),
    INDEX `fk_Carrera_Torneos1_idx`(`Torneos_idTorneos`),
    PRIMARY KEY (`Kartings_idKartings`, `Torneos_idTorneos`, `Circuitos_idCircuitos`, `fechaCarrera`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `circuitos` (
    `idCircuitos` INTEGER NOT NULL AUTO_INCREMENT,
    `distancia` INTEGER NOT NULL,
    `dificultad` VARCHAR(45) NOT NULL,
    `maximo` INTEGER NOT NULL,

    PRIMARY KEY (`idCircuitos`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kartings` (
    `idKartings` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` VARCHAR(45) NOT NULL,
    `modelo` VARCHAR(45) NOT NULL,
    `estado` VARCHAR(45) NOT NULL,
    `fechaAdquisicion` DATE NOT NULL,
    `TiposKarting_idTiposKarting` INTEGER NOT NULL,

    INDEX `fk_Kartings_TiposKarting1_idx`(`TiposKarting_idTiposKarting`),
    PRIMARY KEY (`idKartings`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `licencias` (
    `idLicencias` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaEmision` DATE NOT NULL,
    `fechaVencimiento` DATE NOT NULL,
    `Personas_idPersona` INTEGER NOT NULL,
    `TiposLicencias_idTipoLicencia` INTEGER NOT NULL,

    INDEX `fk_Licencias_Personas1_idx`(`Personas_idPersona`),
    INDEX `fk_Licencias_TiposLicencias1_idx`(`TiposLicencias_idTipoLicencia`),
    PRIMARY KEY (`idLicencias`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `localidades` (
    `idLocalidades` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`idLocalidades`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participaciones` (
    `Carrera_Kartings_idKartings` INTEGER NOT NULL,
    `Carrera_Torneos_idTorneos` INTEGER NOT NULL,
    `Carrera_Circuitos_idCircuitos` INTEGER NOT NULL,
    `Carrera_fecha` DATE NOT NULL,
    `Personas_idPersona` INTEGER NOT NULL,
    `puntos` INTEGER NOT NULL,
    `tiempo` VARCHAR(45) NOT NULL,
    `posicion_final` VARCHAR(45) NOT NULL,

    INDEX `fk_Carrera_has_Personas_Carrera1_idx`(`Carrera_Kartings_idKartings`, `Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`),
    INDEX `fk_Carrera_has_Personas_Personas1_idx`(`Personas_idPersona`),
    PRIMARY KEY (`Carrera_Kartings_idKartings`, `Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`, `Personas_idPersona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personas` (
    `idPersona` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(45) NOT NULL,
    `apellido` VARCHAR(45) NOT NULL,
    `dni` VARCHAR(45) NOT NULL,
    `fechaNacimiento` DATE NOT NULL,
    `mail` VARCHAR(45) NOT NULL,
    `telefono` VARCHAR(45) NOT NULL,
    `contraseña` VARCHAR(255) NOT NULL,
    `Localidades_idLocalidades` INTEGER NOT NULL,

    INDEX `fk_Personas_Localidades_idx`(`Localidades_idLocalidades`),
    PRIMARY KEY (`idPersona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personas_torneos` (
    `Torneos_idTorneos` INTEGER NOT NULL,
    `Personas_idPersona` INTEGER NOT NULL,
    `fecha_inscipcion` DATE NOT NULL,
    `hora_inscripcion` TIME(0) NOT NULL,

    INDEX `fk_Torneos_has_Personas_Personas1_idx`(`Personas_idPersona`),
    INDEX `fk_Torneos_has_Personas_Torneos1_idx`(`Torneos_idTorneos`),
    PRIMARY KEY (`Torneos_idTorneos`, `Personas_idPersona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `idReservas` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaReserva` DATE NOT NULL,
    `monto` DECIMAL(10, 0) NOT NULL,
    `Personas_idPersona` INTEGER NOT NULL,
    `Circuitos_idCircuitos` INTEGER NOT NULL,
    `Kartings_idKartings` INTEGER NOT NULL,

    INDEX `fk_Reservas_Circuitos1_idx`(`Circuitos_idCircuitos`),
    INDEX `fk_Reservas_Kartings1_idx`(`Kartings_idKartings`),
    INDEX `fk_Reservas_Personas1_idx`(`Personas_idPersona`),
    PRIMARY KEY (`idReservas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiposkarting` (
    `idTiposKarting` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(45) NOT NULL,
    `descripcion` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`idTiposKarting`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiposlicencias` (
    `idTipoLicencia` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(45) NOT NULL,
    `descripcion` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`idTipoLicencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torneos` (
    `idTorneos` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(45) NOT NULL,
    `descripcion` VARCHAR(45) NOT NULL,
    `fechaInicio` DATE NOT NULL,
    `fechaFin` DATE NOT NULL,

    PRIMARY KEY (`idTorneos`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `carreras` ADD CONSTRAINT `fk_Carrera_Circuitos1` FOREIGN KEY (`Circuitos_idCircuitos`) REFERENCES `circuitos`(`idCircuitos`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `carreras` ADD CONSTRAINT `fk_Carrera_Kartings1` FOREIGN KEY (`Kartings_idKartings`) REFERENCES `kartings`(`idKartings`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `carreras` ADD CONSTRAINT `fk_Carrera_Torneos1` FOREIGN KEY (`Torneos_idTorneos`) REFERENCES `torneos`(`idTorneos`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kartings` ADD CONSTRAINT `fk_Kartings_TiposKarting1` FOREIGN KEY (`TiposKarting_idTiposKarting`) REFERENCES `tiposkarting`(`idTiposKarting`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `licencias` ADD CONSTRAINT `fk_Licencias_Personas1` FOREIGN KEY (`Personas_idPersona`) REFERENCES `personas`(`idPersona`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `licencias` ADD CONSTRAINT `fk_Licencias_TiposLicencias1` FOREIGN KEY (`TiposLicencias_idTipoLicencia`) REFERENCES `tiposlicencias`(`idTipoLicencia`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participaciones` ADD CONSTRAINT `fk_Carrera_has_Personas_Carrera1` FOREIGN KEY (`Carrera_Kartings_idKartings`, `Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`) REFERENCES `carreras`(`Kartings_idKartings`, `Torneos_idTorneos`, `Circuitos_idCircuitos`, `fechaCarrera`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `participaciones` ADD CONSTRAINT `fk_Carrera_has_Personas_Personas1` FOREIGN KEY (`Personas_idPersona`) REFERENCES `personas`(`idPersona`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `personas` ADD CONSTRAINT `fk_Personas_Localidades` FOREIGN KEY (`Localidades_idLocalidades`) REFERENCES `localidades`(`idLocalidades`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `personas_torneos` ADD CONSTRAINT `fk_Torneos_has_Personas_Personas1` FOREIGN KEY (`Personas_idPersona`) REFERENCES `personas`(`idPersona`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `personas_torneos` ADD CONSTRAINT `fk_Torneos_has_Personas_Torneos1` FOREIGN KEY (`Torneos_idTorneos`) REFERENCES `torneos`(`idTorneos`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `fk_Reservas_Circuitos1` FOREIGN KEY (`Circuitos_idCircuitos`) REFERENCES `circuitos`(`idCircuitos`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `fk_Reservas_Kartings1` FOREIGN KEY (`Kartings_idKartings`) REFERENCES `kartings`(`idKartings`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `fk_Reservas_Personas1` FOREIGN KEY (`Personas_idPersona`) REFERENCES `personas`(`idPersona`) ON DELETE NO ACTION ON UPDATE NO ACTION;
