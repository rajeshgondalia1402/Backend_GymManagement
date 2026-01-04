-- CreateTable
CREATE TABLE "expensegroupmaster" (
    "id" TEXT NOT NULL,
    "expenseGroupName" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expensegroupmaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expensegroupmaster_gymId_idx" ON "expensegroupmaster"("gymId");

-- CreateIndex
CREATE INDEX "expensegroupmaster_expenseGroupName_idx" ON "expensegroupmaster"("expenseGroupName");

-- CreateIndex
CREATE UNIQUE INDEX "expensegroupmaster_expenseGroupName_gymId_key" ON "expensegroupmaster"("expenseGroupName", "gymId");

-- AddForeignKey
ALTER TABLE "expensegroupmaster" ADD CONSTRAINT "expensegroupmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
