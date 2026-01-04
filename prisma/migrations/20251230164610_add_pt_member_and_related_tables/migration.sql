-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('REGULAR', 'PT');

-- CreateEnum
CREATE TYPE "InquirySource" AS ENUM ('WALK_IN', 'PHONE', 'WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'FOLLOW_UP');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "memberType" "MemberType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- CreateTable
CREATE TABLE "PTMember" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "sessionsTotal" INTEGER NOT NULL,
    "sessionsUsed" INTEGER NOT NULL DEFAULT 0,
    "sessionDuration" INTEGER NOT NULL DEFAULT 60,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "goals" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "PTMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplement" (
    "id" TEXT NOT NULL,
    "ptMemberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "timing" TEXT,
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDietPlan" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER,
    "meals" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "MemberDietPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "source" "InquirySource" NOT NULL DEFAULT 'WALK_IN',
    "interest" TEXT,
    "notes" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "followUpDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PTMember_memberId_key" ON "PTMember"("memberId");

-- CreateIndex
CREATE INDEX "PTMember_gymId_idx" ON "PTMember"("gymId");

-- CreateIndex
CREATE INDEX "PTMember_trainerId_idx" ON "PTMember"("trainerId");

-- CreateIndex
CREATE INDEX "PTMember_memberId_idx" ON "PTMember"("memberId");

-- CreateIndex
CREATE INDEX "Supplement_ptMemberId_idx" ON "Supplement"("ptMemberId");

-- CreateIndex
CREATE INDEX "Supplement_gymId_idx" ON "Supplement"("gymId");

-- CreateIndex
CREATE INDEX "MemberDietPlan_memberId_idx" ON "MemberDietPlan"("memberId");

-- CreateIndex
CREATE INDEX "MemberDietPlan_gymId_idx" ON "MemberDietPlan"("gymId");

-- CreateIndex
CREATE INDEX "Inquiry_gymId_idx" ON "Inquiry"("gymId");

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX "Member_memberType_idx" ON "Member"("memberType");

-- AddForeignKey
ALTER TABLE "PTMember" ADD CONSTRAINT "PTMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTMember" ADD CONSTRAINT "PTMember_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplement" ADD CONSTRAINT "Supplement_ptMemberId_fkey" FOREIGN KEY ("ptMemberId") REFERENCES "PTMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDietPlan" ADD CONSTRAINT "MemberDietPlan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
