-- Admin Expense Group Master table
CREATE TABLE IF NOT EXISTS "admin_expense_group_master" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "expenseGroupName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_expense_group_master_pkey" PRIMARY KEY ("id")
);

-- Admin Expense Master table
CREATE TABLE IF NOT EXISTS "admin_expense_master" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "expenseGroupId" TEXT NOT NULL,
    "description" TEXT,
    "paymentMode" "PaymentMode" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_expense_master_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on expense group name
CREATE UNIQUE INDEX IF NOT EXISTS "admin_expense_group_master_expenseGroupName_key" ON "admin_expense_group_master"("expenseGroupName");

-- Indexes
CREATE INDEX IF NOT EXISTS "admin_expense_group_master_expenseGroupName_idx" ON "admin_expense_group_master"("expenseGroupName");
CREATE INDEX IF NOT EXISTS "admin_expense_master_expenseGroupId_idx" ON "admin_expense_master"("expenseGroupId");
CREATE INDEX IF NOT EXISTS "admin_expense_master_expenseDate_idx" ON "admin_expense_master"("expenseDate");
CREATE INDEX IF NOT EXISTS "admin_expense_master_isActive_idx" ON "admin_expense_master"("isActive");
CREATE INDEX IF NOT EXISTS "admin_expense_master_createdBy_idx" ON "admin_expense_master"("createdBy");

-- Foreign keys
ALTER TABLE "admin_expense_master" ADD CONSTRAINT "admin_expense_master_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "admin_expense_group_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_expense_master" ADD CONSTRAINT "admin_expense_master_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
