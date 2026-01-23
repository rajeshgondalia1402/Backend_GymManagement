-- Add coursePackageType column to coursepackage table
-- This column allows differentiating between Regular and PT (Personal Training) packages

-- Create the CoursePackageType enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CoursePackageType') THEN
        CREATE TYPE "CoursePackageType" AS ENUM ('REGULAR', 'PT');
    END IF;
END$$;

-- Add the coursePackageType column with default value 'REGULAR'
ALTER TABLE "coursepackage" 
ADD COLUMN IF NOT EXISTS "coursePackageType" "CoursePackageType" NOT NULL DEFAULT 'REGULAR';

-- Create index for better query performance when filtering by package type
CREATE INDEX IF NOT EXISTS "coursepackage_coursePackageType_idx" ON "coursepackage"("coursePackageType");
