-- CreateTable
CREATE TABLE `franjas_circuito` (
    `Circuitos_idCircuitos` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,

    PRIMARY KEY (`Circuitos_idCircuitos`, `fecha`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `franjas_circuito` ADD CONSTRAINT `fk_FranjasCircuito_Circuitos` FOREIGN KEY (`Circuitos_idCircuitos`) REFERENCES `circuitos`(`idCircuitos`) ON DELETE CASCADE ON UPDATE NO ACTION;
