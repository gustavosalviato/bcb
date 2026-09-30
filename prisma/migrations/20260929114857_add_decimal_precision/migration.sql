/*
  Warnings:

  - You are about to alter the column `balance` on the `Client` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `limit` on the `Client` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "limit" SET DATA TYPE DECIMAL(12,2);
