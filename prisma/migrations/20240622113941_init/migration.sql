/*
  Warnings:

  - You are about to drop the `_groupmembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_groupmembers` DROP FOREIGN KEY `_GroupMembers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_groupmembers` DROP FOREIGN KEY `_GroupMembers_B_fkey`;

-- DropTable
DROP TABLE `_groupmembers`;

-- CreateTable
CREATE TABLE `GroupMembers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GroupMembers` ADD CONSTRAINT `GroupMembers_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupMembers` ADD CONSTRAINT `GroupMembers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
