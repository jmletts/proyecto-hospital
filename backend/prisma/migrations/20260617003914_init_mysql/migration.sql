-- CreateTable
CREATE TABLE `roles` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(191) NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rol` INTEGER NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacientes` (
    `id_paciente` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `dni` VARCHAR(15) NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `fecha_nacimiento` DATE NULL,

    UNIQUE INDEX `pacientes_id_usuario_key`(`id_usuario`),
    UNIQUE INDEX `pacientes_dni_key`(`dni`),
    PRIMARY KEY (`id_paciente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicos` (
    `id_medico` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `cmp` VARCHAR(20) NOT NULL,
    `especialidad` VARCHAR(100) NOT NULL DEFAULT 'Oftalmología General',

    UNIQUE INDEX `medicos_id_usuario_key`(`id_usuario`),
    UNIQUE INDEX `medicos_cmp_key`(`cmp`),
    PRIMARY KEY (`id_medico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios` (
    `id_servicio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `precio` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas` (
    `id_cita` INTEGER NOT NULL AUTO_INCREMENT,
    `id_paciente` INTEGER NOT NULL,
    `id_medico` INTEGER NOT NULL,
    `id_servicio` INTEGER NOT NULL,
    `fecha_hora` DATETIME(0) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    `motivo_consulta` VARCHAR(191) NULL,

    PRIMARY KEY (`id_cita`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historias_clinicas` (
    `id_historia` INTEGER NOT NULL AUTO_INCREMENT,
    `id_paciente` INTEGER NOT NULL,
    `id_cita` INTEGER NOT NULL,
    `fecha_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `agudeza_visual_od` VARCHAR(20) NULL,
    `agudeza_visual_oi` VARCHAR(20) NULL,
    `presion_intraocular_od` VARCHAR(20) NULL,
    `presion_intraocular_oi` VARCHAR(20) NULL,
    `diagnostico` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,

    UNIQUE INDEX `historias_clinicas_id_cita_key`(`id_cita`),
    PRIMARY KEY (`id_historia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recetas_lentes` (
    `id_receta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_historia` INTEGER NOT NULL,
    `od_esfera` DECIMAL(4, 2) NULL,
    `od_cilindro` DECIMAL(4, 2) NULL,
    `od_eje` INTEGER NULL,
    `oi_esfera` DECIMAL(4, 2) NULL,
    `oi_cilindro` DECIMAL(4, 2) NULL,
    `oi_eje` INTEGER NULL,
    `adicion` DECIMAL(4, 2) NULL,
    `distancia_pupilar` DECIMAL(5, 2) NULL,
    `fecha_emision` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `recetas_lentes_id_historia_key`(`id_historia`),
    PRIMARY KEY (`id_receta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facturacion` (
    `id_factura` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cita` INTEGER NOT NULL,
    `monto_total` DECIMAL(10, 2) NOT NULL,
    `fecha_emision` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `metodo_pago` VARCHAR(50) NULL,
    `estado_pago` VARCHAR(20) NOT NULL DEFAULT 'Pendiente',

    UNIQUE INDEX `facturacion_id_cita_key`(`id_cita`),
    PRIMARY KEY (`id_factura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `pacientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicos` ADD CONSTRAINT `medicos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_id_paciente_fkey` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes`(`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_id_medico_fkey` FOREIGN KEY (`id_medico`) REFERENCES `medicos`(`id_medico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_id_servicio_fkey` FOREIGN KEY (`id_servicio`) REFERENCES `servicios`(`id_servicio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historias_clinicas` ADD CONSTRAINT `historias_clinicas_id_paciente_fkey` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes`(`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historias_clinicas` ADD CONSTRAINT `historias_clinicas_id_cita_fkey` FOREIGN KEY (`id_cita`) REFERENCES `citas`(`id_cita`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recetas_lentes` ADD CONSTRAINT `recetas_lentes_id_historia_fkey` FOREIGN KEY (`id_historia`) REFERENCES `historias_clinicas`(`id_historia`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facturacion` ADD CONSTRAINT `facturacion_id_cita_fkey` FOREIGN KEY (`id_cita`) REFERENCES `citas`(`id_cita`) ON DELETE RESTRICT ON UPDATE CASCADE;
