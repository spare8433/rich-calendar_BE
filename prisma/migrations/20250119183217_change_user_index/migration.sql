-- DropIndex
DROP INDEX `User_email_id_idx` ON `User`;

-- CreateIndex
CREATE INDEX `User_email_id_username_idx` ON `User`(`email`, `id`, `username`);
