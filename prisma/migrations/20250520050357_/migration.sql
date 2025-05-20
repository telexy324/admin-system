/*
  Warnings:

  - You are about to drop the `leave_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "leaves" DROP CONSTRAINT "leaves_typeId_fkey";

-- DropTable
DROP TABLE "leave_types";

-- CreateTable
CREATE TABLE "leave_balance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(65,30) NOT NULL,
    "year" INTEGER DEFAULT 0,
    "action" INTEGER NOT NULL DEFAULT 1,
    "userId" INTEGER NOT NULL,
    "leaveId" INTEGER NOT NULL,

    CONSTRAINT "leave_balance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "leaves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
