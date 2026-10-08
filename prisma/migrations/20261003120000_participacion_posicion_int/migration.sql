-- AlterTable: conversion in-place; los 36 valores existentes son enteros limpios ("1".."3")
ALTER TABLE `participaciones` MODIFY `posicion_final` INTEGER NOT NULL;

-- CreateIndex: una posicion por carrera
CREATE UNIQUE INDEX `uq_participacion_posicion` ON `participaciones`(`Carrera_Kartings_idKartings`, `Carrera_Torneos_idTorneos`, `Carrera_Circuitos_idCircuitos`, `Carrera_fecha`, `posicion_final`);
