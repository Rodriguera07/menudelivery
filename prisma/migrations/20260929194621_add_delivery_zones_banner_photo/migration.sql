-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('FIXED', 'BY_DISTRICT');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'FIXED';

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryZone_storeId_name_key" ON "DeliveryZone"("storeId", "name");

-- AddForeignKey
ALTER TABLE "DeliveryZone" ADD CONSTRAINT "DeliveryZone_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
