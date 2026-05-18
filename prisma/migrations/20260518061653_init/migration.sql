-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(200) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `role` ENUM('Admin', 'Technician') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `contactPerson` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `machines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `machineName` VARCHAR(200) NOT NULL,
    `serialNumber` VARCHAR(100) NOT NULL,
    `machineType` VARCHAR(100) NOT NULL,
    `customerId` INTEGER NULL,
    `location` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `machines_serialNumber_key`(`serialNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `customerId` INTEGER NULL,
    `machineId` INTEGER NULL,
    `technicianId` INTEGER NULL,
    `taskType` ENUM('Installation', 'Refurbishment', 'Maintenance', 'Repair', 'Collection') NOT NULL,
    `status` ENUM('Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `completionNotes` TEXT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskItemId` INTEGER NOT NULL,
    `changedByUserId` INTEGER NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `oldStatus` ENUM('Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled') NULL,
    `newStatus` ENUM('Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled') NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_photos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskItemId` INTEGER NOT NULL,
    `uploadedByUserId` INTEGER NOT NULL,
    `fileName` VARCHAR(300) NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `contentType` VARCHAR(100) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `machines` ADD CONSTRAINT `machines_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_items` ADD CONSTRAINT `task_items_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_items` ADD CONSTRAINT `task_items_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `machines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_items` ADD CONSTRAINT `task_items_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_histories` ADD CONSTRAINT `task_histories_taskItemId_fkey` FOREIGN KEY (`taskItemId`) REFERENCES `task_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_histories` ADD CONSTRAINT `task_histories_changedByUserId_fkey` FOREIGN KEY (`changedByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_photos` ADD CONSTRAINT `task_photos_taskItemId_fkey` FOREIGN KEY (`taskItemId`) REFERENCES `task_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_photos` ADD CONSTRAINT `task_photos_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
