-- Precio por hora en el tipo de karting.
-- Se agrega con DEFAULT para poder rellenar las filas que ya existen, se cargan los
-- precios acordados y despues se saca el DEFAULT para que toda alta nueva lo declare.
ALTER TABLE `tiposkarting` ADD COLUMN `precioHora` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

UPDATE `tiposkarting` SET `precioHora` = 15000.00 WHERE `idTiposKarting` = 1; -- Junior
UPDATE `tiposkarting` SET `precioHora` = 20000.00 WHERE `idTiposKarting` = 2; -- Senior
UPDATE `tiposkarting` SET `precioHora` = 30000.00 WHERE `idTiposKarting` = 3; -- Competicion

ALTER TABLE `tiposkarting` ALTER COLUMN `precioHora` DROP DEFAULT;

-- Franja horaria de la reserva. Las 12 reservas existentes no tenian hora: se las
-- rellena con una franja de 10 a 11 (ninguna comparte fecha+karting, asi que el
-- relleno no genera solapamientos).
ALTER TABLE `reservas` ADD COLUMN `horaInicio` TIME(0) NOT NULL DEFAULT '10:00:00',
    ADD COLUMN `horaFin` TIME(0) NOT NULL DEFAULT '11:00:00';

ALTER TABLE `reservas` ALTER COLUMN `horaInicio` DROP DEFAULT;
ALTER TABLE `reservas` ALTER COLUMN `horaFin` DROP DEFAULT;

-- Recalcular los montos existentes con la formula nueva: precioHora del tipo de
-- karting por la duracion de la reserva, que tras el relleno es de 1 hora.
UPDATE `reservas` `r`
    JOIN `kartings` `k` ON `k`.`idKartings` = `r`.`Kartings_idKartings`
    JOIN `tiposkarting` `tk` ON `tk`.`idTiposKarting` = `k`.`TiposKarting_idTiposKarting`
    SET `r`.`monto` = `tk`.`precioHora`
        * (TIME_TO_SEC(TIMEDIFF(`r`.`horaFin`, `r`.`horaInicio`)) / 3600);
