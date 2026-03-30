-- AlterTable: Add gender and mobile index to gym_owner_lead
ALTER TABLE "gym_owner_lead" ADD COLUMN "gender" TEXT NOT NULL DEFAULT 'Male';

-- CreateIndex
CREATE INDEX "gym_owner_lead_mobile_idx" ON "gym_owner_lead"("mobile");
