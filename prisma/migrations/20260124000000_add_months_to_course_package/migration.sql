-- Add Months column to coursepackage table
-- First add column with default value for existing rows
ALTER TABLE "coursepackage" ADD COLUMN "Months" INTEGER NOT NULL DEFAULT 1;
