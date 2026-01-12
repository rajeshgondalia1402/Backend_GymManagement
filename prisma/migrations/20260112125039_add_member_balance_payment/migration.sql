-- CreateTable
CREATE TABLE "memberbalancepayment" (
    "id" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactNo" TEXT,
    "paidFees" DECIMAL(10,2) NOT NULL,
    "payMode" TEXT NOT NULL,
    "nextPaymentDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "memberbalancepayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memberbalancepayment_memberId_idx" ON "memberbalancepayment"("memberId");

-- CreateIndex
CREATE INDEX "memberbalancepayment_gymId_idx" ON "memberbalancepayment"("gymId");

-- CreateIndex
CREATE INDEX "memberbalancepayment_receiptNo_idx" ON "memberbalancepayment"("receiptNo");

-- CreateIndex
CREATE INDEX "memberbalancepayment_paymentDate_idx" ON "memberbalancepayment"("paymentDate");

-- AddForeignKey
ALTER TABLE "memberbalancepayment" ADD CONSTRAINT "memberbalancepayment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
