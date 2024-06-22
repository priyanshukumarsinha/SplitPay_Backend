-- AlterTable
ALTER TABLE `group` ADD COLUMN `amount` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `groupmembers` ADD COLUMN `share` DOUBLE NOT NULL DEFAULT 0;
