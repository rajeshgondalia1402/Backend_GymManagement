-- Add attachments field to ExpenseMaster table
ALTER TABLE "expensemaster" ADD COLUMN "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
