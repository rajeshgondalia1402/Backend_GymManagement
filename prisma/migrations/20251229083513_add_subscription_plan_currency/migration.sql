-- AlterTable
ALTER TABLE "GymSubscriptionPlan" ADD COLUMN     "priceCurrency" TEXT NOT NULL DEFAULT 'INR',
ALTER COLUMN "features" SET NOT NULL,
ALTER COLUMN "features" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "GymSubscriptionPlan_isActive_idx" ON "GymSubscriptionPlan"("isActive");

-- CreateIndex
CREATE INDEX "GymSubscriptionPlan_priceCurrency_idx" ON "GymSubscriptionPlan"("priceCurrency");
