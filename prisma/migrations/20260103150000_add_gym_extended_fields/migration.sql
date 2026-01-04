-- Add extended fields to Gym table
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "address1" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "address2" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "zipcode" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "mobileNo" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "phoneNo" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "gstRegNo" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "note" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "gymLogo" TEXT;

-- Migrate existing address data to address1 (if any exists)
UPDATE "Gym" SET "address1" = "address" WHERE "address" IS NOT NULL AND "address1" IS NULL;

-- Migrate existing phone data to phoneNo (if any exists)
UPDATE "Gym" SET "phoneNo" = "phone" WHERE "phone" IS NOT NULL AND "phoneNo" IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Gym_city_idx" ON "Gym"("city");
CREATE INDEX IF NOT EXISTS "Gym_state_idx" ON "Gym"("state");
CREATE INDEX IF NOT EXISTS "Gym_zipcode_idx" ON "Gym"("zipcode");
CREATE INDEX IF NOT EXISTS "Gym_gstRegNo_idx" ON "Gym"("gstRegNo");
