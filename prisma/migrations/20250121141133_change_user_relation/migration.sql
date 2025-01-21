-- DropForeignKey
ALTER TABLE `EmailCode` DROP FOREIGN KEY `EmailCode_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PasswordCode` DROP FOREIGN KEY `PasswordCode_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_user_id_fkey`;

-- DropIndex
DROP INDEX `EmailCode_user_id_key` ON `EmailCode`;

-- DropIndex
DROP INDEX `PasswordCode_user_id_key` ON `PasswordCode`;

-- DropIndex
DROP INDEX `Schedule_user_id_key` ON `Schedule`;

-- DropIndex
DROP INDEX `Tag_user_id_key` ON `Tag`;

-- AddForeignKey
ALTER TABLE `EmailCode` ADD CONSTRAINT `EmailCode_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordCode` ADD CONSTRAINT `PasswordCode_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
