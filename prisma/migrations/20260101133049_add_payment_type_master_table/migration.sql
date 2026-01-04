-- CreateTable
CREATE TABLE "paymenttypemaster" (
    "id" TEXT NOT NULL,
    "paymentTypeName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "paymenttypemaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paymenttypemaster_paymentTypeName_key" ON "paymenttypemaster"("paymentTypeName");

-- CreateIndex
CREATE INDEX "paymenttypemaster_isActive_idx" ON "paymenttypemaster"("isActive");

-- CreateIndex
CREATE INDEX "paymenttypemaster_paymentTypeName_idx" ON "paymenttypemaster"("paymentTypeName");
