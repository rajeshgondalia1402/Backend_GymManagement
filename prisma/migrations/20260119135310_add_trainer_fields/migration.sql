-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "idProofDocument" TEXT,
ADD COLUMN     "idProofType" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "salary" DECIMAL(10,2),
ADD COLUMN     "trainerPhoto" TEXT;

-- CreateIndex
CREATE INDEX "Trainer_isActive_idx" ON "Trainer"("isActive");
