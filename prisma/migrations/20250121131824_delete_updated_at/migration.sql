/*
  Warnings:

  - You are about to drop the column `updated_at` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `updated_at`;

-- AlterTable
ALTER TABLE `Tag` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `updatedAt`;
