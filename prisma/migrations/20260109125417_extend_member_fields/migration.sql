-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "altContactNo" TEXT,
ADD COLUMN     "anniversaryDate" TIMESTAMP(3),
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "idProofDocument" TEXT,
ADD COLUMN     "idProofType" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "memberPhoto" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "smsFacility" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Member_memberId_idx" ON "Member"("memberId");

-- CreateIndex
CREATE INDEX "Member_isActive_idx" ON "Member"("isActive");
