-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fazendas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `tipo` ENUM('CORTE', 'LEITE', 'MISTO') NOT NULL DEFAULT 'CORTE',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_fazenda` (
    `usuario_id` VARCHAR(191) NOT NULL,
    `fazenda_id` VARCHAR(191) NOT NULL,
    `papel` ENUM('ADMIN', 'EDITOR', 'VISUALIZADOR') NOT NULL DEFAULT 'VISUALIZADOR',

    PRIMARY KEY (`usuario_id`, `fazenda_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animais` (
    `id` VARCHAR(191) NOT NULL,
    `fazenda_id` VARCHAR(191) NOT NULL,
    `brinco` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `raca` VARCHAR(191) NULL,
    `nascimento` DATETIME(3) NULL,
    `peso_kg` DECIMAL(65, 30) NULL,
    `status` ENUM('ATIVA', 'SECA', 'DESCARTADA', 'VENDIDA', 'MORTA') NOT NULL DEFAULT 'ATIVA',
    `foto_url` VARCHAR(191) NULL,
    `observacoes` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `animais_fazenda_id_brinco_key`(`fazenda_id`, `brinco`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos_reprodutivos` (
    `id` VARCHAR(191) NOT NULL,
    `animal_id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NULL,
    `tipo` ENUM('CIO', 'IA', 'MONTA', 'DIAGNOSTICO_GESTACAO', 'PARTO', 'DESMAME', 'DESCARTE') NOT NULL,
    `data_evento` DATETIME(3) NOT NULL,
    `resultado` BOOLEAN NULL,
    `observacoes` TEXT NULL,
    `dados_extras` JSON NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gestacoes` (
    `id` VARCHAR(191) NOT NULL,
    `animal_id` VARCHAR(191) NOT NULL,
    `evento_cobertura_id` VARCHAR(191) NULL,
    `data_cobertura` DATETIME(3) NOT NULL,
    `dpp` DATETIME(3) NOT NULL,
    `data_parto_real` DATETIME(3) NULL,
    `status` ENUM('SUSPEITA', 'CONFIRMADA', 'ABORTADA', 'CONCLUIDA') NOT NULL DEFAULT 'SUSPEITA',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gestacoes_evento_cobertura_id_key`(`evento_cobertura_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(500) NOT NULL,
    `p256dh` VARCHAR(191) NOT NULL,
    `auth` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `push_subscriptions_endpoint_key`(`endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas` (
    `id` VARCHAR(191) NOT NULL,
    `gestacao_id` VARCHAR(191) NOT NULL,
    `fazenda_id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('CIO_RETORNO', 'PRE_PARTO_13D', 'PRE_PARTO_7D', 'PRE_PARTO_3D', 'DPP', 'POS_DPP_SEM_REGISTRO') NOT NULL,
    `data_disparo` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'ENVIADO', 'FALHOU', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `destinatarios` JSON NOT NULL,
    `enviado_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario_fazenda` ADD CONSTRAINT `usuario_fazenda_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_fazenda` ADD CONSTRAINT `usuario_fazenda_fazenda_id_fkey` FOREIGN KEY (`fazenda_id`) REFERENCES `fazendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animais` ADD CONSTRAINT `animais_fazenda_id_fkey` FOREIGN KEY (`fazenda_id`) REFERENCES `fazendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_reprodutivos` ADD CONSTRAINT `eventos_reprodutivos_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_reprodutivos` ADD CONSTRAINT `eventos_reprodutivos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gestacoes` ADD CONSTRAINT `gestacoes_animal_id_fkey` FOREIGN KEY (`animal_id`) REFERENCES `animais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gestacoes` ADD CONSTRAINT `gestacoes_evento_cobertura_id_fkey` FOREIGN KEY (`evento_cobertura_id`) REFERENCES `eventos_reprodutivos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_gestacao_id_fkey` FOREIGN KEY (`gestacao_id`) REFERENCES `gestacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_fazenda_id_fkey` FOREIGN KEY (`fazenda_id`) REFERENCES `fazendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

