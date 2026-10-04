-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "waConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "waConnectedAt" TIMESTAMP(3);
