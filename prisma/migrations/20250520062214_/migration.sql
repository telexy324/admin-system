/*
  Warnings:

  - You are about to drop the `leaves` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "leave_balance" DROP CONSTRAINT "leave_balance_leaveId_fkey";

-- DropForeignKey
ALTER TABLE "leaves" DROP CONSTRAINT "leaves_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "leaves" DROP CONSTRAINT "leaves_userId_fkey";

-- AlterTable
ALTER TABLE "storages" ADD COLUMN     "leaveId" INTEGER;

-- DropTable
DROP TABLE "leaves";

-- CreateTable
CREATE TABLE "leave" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "type" INTEGER NOT NULL DEFAULT 1,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "approverId" INTEGER,
    "comment" TEXT,
    "done_at" TIMESTAMP(3),

    CONSTRAINT "leave_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "leave"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "leave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
