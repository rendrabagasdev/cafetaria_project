-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('USER', 'KASIR', 'PENGURUS', 'MITRA') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaBarang` VARCHAR(255) NOT NULL,
    `fotoUrl` VARCHAR(500) NOT NULL,
    `jumlahStok` INTEGER NOT NULL DEFAULT 0,
    `hargaSatuan` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('TERSEDIA', 'HABIS', 'MENUNGGU_KONFIRMASI', 'DITOLAK', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `mitraId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Item_mitraId_idx`(`mitraId`),
    INDEX `Item_status_idx`(`status`),
    INDEX `Item_mitraId_status_idx`(`mitraId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PosSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(100) NOT NULL,
    `kasirId` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'PAYMENT', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `firebaseSessionPath` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `closedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PosSession_sessionId_key`(`sessionId`),
    INDEX `PosSession_kasirId_idx`(`kasirId`),
    INDEX `PosSession_status_idx`(`status`),
    INDEX `PosSession_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `posSessionId` INTEGER NULL,
    `grossAmount` DECIMAL(10, 2) NOT NULL,
    `paymentFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `platformFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `netAmount` DECIMAL(10, 2) NOT NULL,
    `mitraRevenue` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('QRIS', 'CASH') NOT NULL DEFAULT 'QRIS',
    `status` ENUM('PENDING', 'SETTLEMENT', 'EXPIRE', 'CANCEL', 'CASH', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `midtransOrderId` VARCHAR(100) NULL,
    `qrisUrl` VARCHAR(500) NULL,
    `paymentExpireAt` DATETIME(3) NULL,
    `settledAt` DATETIME(3) NULL,
    `customerName` VARCHAR(255) NULL,
    `customerLocation` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `createdBy` INTEGER NULL,
    `approvedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaction_midtransOrderId_key`(`midtransOrderId`),
    INDEX `Transaction_userId_idx`(`userId`),
    INDEX `Transaction_createdAt_status_idx`(`createdAt`, `status`),
    INDEX `Transaction_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Transaction_status_idx`(`status`),
    INDEX `Transaction_posSessionId_idx`(`posSessionId`),
    INDEX `Transaction_midtransOrderId_idx`(`midtransOrderId`),
    INDEX `Transaction_paymentMethod_status_idx`(`paymentMethod`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `hargaSatuan` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `stokSebelum` INTEGER NOT NULL,
    `stokSesudah` INTEGER NOT NULL,

    INDEX `TransactionDetail_transactionId_idx`(`transactionId`),
    INDEX `TransactionDetail_itemId_idx`(`itemId`),
    INDEX `TransactionDetail_itemId_transactionId_idx`(`itemId`, `transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `qrisFeePercent` DECIMAL(5, 2) NOT NULL DEFAULT 0.7,
    `platformCommissionPercent` DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
    `defaultPaymentMethod` VARCHAR(10) NOT NULL DEFAULT 'QRIS',
    `paymentTimeoutMinutes` INTEGER NOT NULL DEFAULT 5,
    `cafeteriaName` VARCHAR(255) NOT NULL DEFAULT 'Cafetaria Sekolah',
    `cafeteriaTagline` VARCHAR(255) NOT NULL DEFAULT 'Delicious & Fresh',
    `heroTitle` VARCHAR(500) NOT NULL DEFAULT 'Selamat Datang di Cafetaria Kami',
    `heroDescription` VARCHAR(1000) NULL,
    `logoUrl` VARCHAR(500) NULL,
    `footerText` VARCHAR(1000) NOT NULL DEFAULT '© 2025 Cafetaria. All rights reserved.',
    `kasirWhatsapp` VARCHAR(20) NOT NULL DEFAULT '',
    `contactInfo` TEXT NULL,
    `namaPengurus` VARCHAR(255) NOT NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_mitraId_fkey` FOREIGN KEY (`mitraId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosSession` ADD CONSTRAINT `PosSession_kasirId_fkey` FOREIGN KEY (`kasirId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_posSessionId_fkey` FOREIGN KEY (`posSessionId`) REFERENCES `PosSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionDetail` ADD CONSTRAINT `TransactionDetail_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionDetail` ADD CONSTRAINT `TransactionDetail_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
