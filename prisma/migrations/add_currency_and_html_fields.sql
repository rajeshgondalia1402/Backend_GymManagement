-- Migration: Add currency field and update text fields for HTML content
-- Created: 2025-12-29

-- AlterTable: GymSubscriptionPlan
-- Add priceCurrency field with default INR
-- Change description and features to Text type for HTML content

BEGIN;

-- Add priceCurrency column with default value
ALTER TABLE "GymSubscriptionPlan" 
ADD COLUMN "priceCurrency" TEXT NOT NULL DEFAULT 'INR';

-- Update description column to TEXT type (for large HTML content)
ALTER TABLE "GymSubscriptionPlan" 
ALTER COLUMN "description" TYPE TEXT;

-- Update features column to TEXT type (for HTML ul/li lists)
-- Note: This drops the array type and converts to TEXT
ALTER TABLE "GymSubscriptionPlan" 
DROP COLUMN "features",
ADD COLUMN "features" TEXT NOT NULL DEFAULT '';

-- Add indexes for better query performance
CREATE INDEX "GymSubscriptionPlan_isActive_idx" ON "GymSubscriptionPlan"("isActive");
CREATE INDEX "GymSubscriptionPlan_priceCurrency_idx" ON "GymSubscriptionPlan"("priceCurrency");

COMMIT;
