/*
  Warnings:

  - You are about to drop the column `order` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `permissions` table. All the data in the column will be lost.
  - You are about to drop the `_MenuToPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoleToMenu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoleToPermission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `menus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_MenuToPermission" DROP CONSTRAINT "_MenuToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_MenuToPermission" DROP CONSTRAINT "_MenuToPermission_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToMenu" DROP CONSTRAINT "_RoleToMenu_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToMenu" DROP CONSTRAINT "_RoleToMenu_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToPermission" DROP CONSTRAINT "_RoleToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToPermission" DROP CONSTRAINT "_RoleToPermission_B_fkey";

-- DropIndex
DROP INDEX "menus_path_key";

-- DropIndex
DROP INDEX "permissions_code_key";

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "code",
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "_MenuToPermission";

-- DropTable
DROP TABLE "_RoleToMenu";

-- DropTable
DROP TABLE "_RoleToPermission";

-- CreateTable
CREATE TABLE "leave_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "days" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolePermissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoleMenus" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoleMenus_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_key" ON "leave_types"("name");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");

-- CreateIndex
CREATE INDEX "_RoleMenus_B_index" ON "_RoleMenus"("B");

-- CreateIndex
CREATE UNIQUE INDEX "menus_name_key" ON "menus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleMenus" ADD CONSTRAINT "_RoleMenus_A_fkey" FOREIGN KEY ("A") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleMenus" ADD CONSTRAINT "_RoleMenus_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
