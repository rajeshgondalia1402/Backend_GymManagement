-- Add name, email, password fields to Trainer table
-- (password column may already exist from previous migration, using IF NOT EXISTS)
ALTER TABLE "Trainer" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "Trainer" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Trainer" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Add unique index on Trainer email
CREATE UNIQUE INDEX IF NOT EXISTS "Trainer_email_key" ON "Trainer"("email");
CREATE INDEX IF NOT EXISTS "Trainer_email_idx" ON "Trainer"("email");

-- Add name, email, password fields to Member table
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Add unique index on Member email
CREATE UNIQUE INDEX IF NOT EXISTS "Member_email_key" ON "Member"("email");
CREATE INDEX IF NOT EXISTS "Member_email_idx" ON "Member"("email");

-- Add ownerPassword field to Gym table
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "ownerPassword" TEXT;

-- Enhance PasswordResetHistory table with additional tracking fields
ALTER TABLE "passwordresethistory" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "passwordresethistory" ADD COLUMN IF NOT EXISTS "resetByEmail" TEXT;
ALTER TABLE "passwordresethistory" ADD COLUMN IF NOT EXISTS "targetTable" TEXT;
ALTER TABLE "passwordresethistory" ADD COLUMN IF NOT EXISTS "gymId" TEXT;
ALTER TABLE "passwordresethistory" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

-- Add indexes to PasswordResetHistory for reporting
CREATE INDEX IF NOT EXISTS "passwordresethistory_email_idx" ON "passwordresethistory"("email");
CREATE INDEX IF NOT EXISTS "passwordresethistory_roleName_idx" ON "passwordresethistory"("roleName");
CREATE INDEX IF NOT EXISTS "passwordresethistory_gymId_idx" ON "passwordresethistory"("gymId");

-- Sync existing Trainer data: populate name and email from User table
UPDATE "Trainer" t
SET "name" = u."name", "email" = u."email"
FROM "User" u
WHERE t."userId" = u."id" AND (t."name" IS NULL OR t."email" IS NULL);

-- Sync existing Member data: populate name and email from User table
UPDATE "Member" m
SET "name" = u."name", "email" = u."email"
FROM "User" u
WHERE m."userId" = u."id" AND (m."name" IS NULL OR m."email" IS NULL);

-- Sync existing Member passwords: copy hashed passwords from User table
UPDATE "Member" m
SET "password" = u."password"
FROM "User" u
WHERE m."userId" = u."id" AND m."password" IS NULL;

-- Sync existing Trainer hashed passwords: copy hashed passwords from User table
-- (Note: existing trainer.password may contain plain text, so we overwrite with hashed)
UPDATE "Trainer" t
SET "password" = u."password"
FROM "User" u
WHERE t."userId" = u."id";
