-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pixExpiresAt" TIMESTAMP(3),
ADD COLUMN     "pixPaidAt" TIMESTAMP(3),
ADD COLUMN     "pixPaymentId" TEXT,
ADD COLUMN     "pixQrCode" TEXT,
ADD COLUMN     "pixQrCodeBase64" TEXT;
