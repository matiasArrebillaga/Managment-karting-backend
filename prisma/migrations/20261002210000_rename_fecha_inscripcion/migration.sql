-- Corrige el typo de la columna. Escrita a mano a proposito: Prisma no detecta renames,
-- genera DROP COLUMN + ADD COLUMN y se lleva las inscripciones que ya estan cargadas.
ALTER TABLE `personas_torneos` RENAME COLUMN `fecha_inscipcion` TO `fecha_inscripcion`;
