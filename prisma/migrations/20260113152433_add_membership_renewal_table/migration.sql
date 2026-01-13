-- CreateEnum
CREATE TYPE "RenewalType" AS ENUM ('STANDARD', 'EARLY', 'LATE', 'UPGRADE', 'DOWNGRADE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'PARTIAL');

-- CreateTable
CREATE TABLE "membershiprenewal" (
    "id" TEXT NOT NULL,
    "renewalNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "previousMembershipStart" TIMESTAMP(3) NOT NULL,
    "previousMembershipEnd" TIMESTAMP(3) NOT NULL,
    "newMembershipStart" TIMESTAMP(3) NOT NULL,
    "newMembershipEnd" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalType" "RenewalType" NOT NULL DEFAULT 'STANDARD',
    "coursePackageId" TEXT,
    "packageFees" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "afterDiscount" DECIMAL(10,2),
    "extraDiscount" DECIMAL(10,2),
    "finalFees" DECIMAL(10,2),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMode" TEXT,
    "paidAmount" DECIMAL(10,2),
    "pendingAmount" DECIMAL(10,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "membershiprenewal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membershiprenewal_memberId_idx" ON "membershiprenewal"("memberId");

-- CreateIndex
CREATE INDEX "membershiprenewal_gymId_idx" ON "membershiprenewal"("gymId");

-- CreateIndex
CREATE INDEX "membershiprenewal_renewalNumber_idx" ON "membershiprenewal"("renewalNumber");

-- CreateIndex
CREATE INDEX "membershiprenewal_renewalDate_idx" ON "membershiprenewal"("renewalDate");

-- CreateIndex
CREATE INDEX "membershiprenewal_paymentStatus_idx" ON "membershiprenewal"("paymentStatus");

-- AddForeignKey
ALTER TABLE "membershiprenewal" ADD CONSTRAINT "membershiprenewal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
