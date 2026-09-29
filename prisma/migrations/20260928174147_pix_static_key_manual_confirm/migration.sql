/*
  Warnings:

  - You are about to drop the column `pixExpiresAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pixPaymentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pixQrCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pixQrCodeBase64` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "pixExpiresAt",
DROP COLUMN "pixPaymentId",
DROP COLUMN "pixQrCode",
DROP COLUMN "pixQrCodeBase64";

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "pixKey" TEXT;
