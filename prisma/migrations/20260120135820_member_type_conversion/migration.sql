-- CreateEnum
CREATE TYPE "PaymentFor" AS ENUM ('REGULAR', 'PT');

-- AlterEnum
ALTER TYPE "MemberType" ADD VALUE 'REGULAR_PT';

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "hasPTAddon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ptAfterDiscount" DECIMAL(10,2),
ADD COLUMN     "ptExtraDiscount" DECIMAL(10,2),
ADD COLUMN     "ptFinalFees" DECIMAL(10,2),
ADD COLUMN     "ptMaxDiscount" DECIMAL(10,2),
ADD COLUMN     "ptPackageFees" DECIMAL(10,2),
ADD COLUMN     "ptPackageName" TEXT;

-- AlterTable
ALTER TABLE "memberbalancepayment" ADD COLUMN     "paymentFor" "PaymentFor" NOT NULL DEFAULT 'REGULAR';

-- CreateTable
CREATE TABLE "ptsessioncredit" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sessionCredits" INTEGER NOT NULL,
    "originalPackage" TEXT NOT NULL,
    "creditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ptsessioncredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ptsessioncredit_memberId_idx" ON "ptsessioncredit"("memberId");

-- CreateIndex
CREATE INDEX "ptsessioncredit_gymId_idx" ON "ptsessioncredit"("gymId");

-- CreateIndex
CREATE INDEX "ptsessioncredit_expiryDate_idx" ON "ptsessioncredit"("expiryDate");

-- CreateIndex
CREATE INDEX "ptsessioncredit_isActive_idx" ON "ptsessioncredit"("isActive");

-- CreateIndex
CREATE INDEX "Member_hasPTAddon_idx" ON "Member"("hasPTAddon");

-- CreateIndex
CREATE INDEX "memberbalancepayment_paymentFor_idx" ON "memberbalancepayment"("paymentFor");

-- AddForeignKey
ALTER TABLE "ptsessioncredit" ADD CONSTRAINT "ptsessioncredit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
