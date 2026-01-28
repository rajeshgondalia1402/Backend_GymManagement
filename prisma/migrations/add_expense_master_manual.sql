-- Add PaymentMode enum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER');

-- Create ExpenseMaster table
CREATE TABLE "expensemaster" (
    "id" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "expenseGroupId" TEXT NOT NULL,
    "description" TEXT,
    "paymentMode" "PaymentMode" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expensemaster_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "expensemaster_gymId_idx" ON "expensemaster"("gymId");
CREATE INDEX "expensemaster_expenseGroupId_idx" ON "expensemaster"("expenseGroupId");
CREATE INDEX "expensemaster_expenseDate_idx" ON "expensemaster"("expenseDate");
CREATE INDEX "expensemaster_isActive_idx" ON "expensemaster"("isActive");
CREATE INDEX "expensemaster_createdBy_idx" ON "expensemaster"("createdBy");

-- Add foreign keys
ALTER TABLE "expensemaster" ADD CONSTRAINT "expensemaster_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "expensegroupmaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expensemaster" ADD CONSTRAINT "expensemaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
