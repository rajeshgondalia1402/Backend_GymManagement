-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- CreateTable
CREATE TABLE "coursepackage" (
    "id" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "description" TEXT,
    "fees" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "coursepackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coursepackage_gymId_idx" ON "coursepackage"("gymId");

-- CreateIndex
CREATE INDEX "coursepackage_packageName_idx" ON "coursepackage"("packageName");

-- CreateIndex
CREATE INDEX "coursepackage_isActive_idx" ON "coursepackage"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "coursepackage_packageName_gymId_key" ON "coursepackage"("packageName", "gymId");

-- AddForeignKey
ALTER TABLE "coursepackage" ADD CONSTRAINT "coursepackage_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
