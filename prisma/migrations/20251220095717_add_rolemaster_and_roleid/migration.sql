/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT;

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Rolemaster" (
    "Id" TEXT NOT NULL,
    "rolename" TEXT NOT NULL,

    CONSTRAINT "Rolemaster_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Rolemaster"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
