-- CreateIndex
CREATE UNIQUE INDEX `roles_nombre_key` ON `roles`(`nombre`);

-- CreateIndex
CREATE UNIQUE INDEX `personas_dni_key` ON `personas`(`dni`);

-- CreateIndex
CREATE UNIQUE INDEX `personas_mail_key` ON `personas`(`mail`);
