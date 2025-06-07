/*
  Warnings:

  - You are about to drop the column `type` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "type",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'daily';
