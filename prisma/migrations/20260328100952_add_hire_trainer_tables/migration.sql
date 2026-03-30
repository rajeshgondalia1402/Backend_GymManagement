-- CreateEnum
CREATE TYPE "HireTrainerRole" AS ENUM ('FIRST_HALF', 'SECOND_HALF', 'FULL_TIME');

-- CreateEnum
CREATE TYPE "HireTrainerStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Member_email_key";

-- CreateTable
CREATE TABLE "hire_trainer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "fullName" TEXT,
    "address" TEXT,
    "whatsappNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "state" TEXT,
    "city" TEXT,
    "role" "HireTrainerRole",
    "totalYearsExperience" INTEGER,
    "ptExperienceYears" INTEGER,
    "ptExperienceMonths" INTEGER,
    "currentSalary" DECIMAL(10,2),
    "expectedSalary" DECIMAL(10,2),
    "howSoonCanJoin" TEXT,
    "specialization" TEXT,
    "currentGymName" TEXT,
    "reasonForLeaving" TEXT,
    "numberOfGymsChanged" INTEGER,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "status" "HireTrainerStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hire_trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hire_trainer_verification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "otpCode" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hire_trainer_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hire_trainer_document" (
    "id" TEXT NOT NULL,
    "hireTrainerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hire_trainer_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hire_trainer_email_key" ON "hire_trainer"("email");

-- CreateIndex
CREATE INDEX "hire_trainer_status_idx" ON "hire_trainer"("status");

-- CreateIndex
CREATE INDEX "hire_trainer_city_idx" ON "hire_trainer"("city");

-- CreateIndex
CREATE INDEX "hire_trainer_role_idx" ON "hire_trainer"("role");

-- CreateIndex
CREATE INDEX "hire_trainer_specialization_idx" ON "hire_trainer"("specialization");

-- CreateIndex
CREATE UNIQUE INDEX "hire_trainer_verification_email_key" ON "hire_trainer_verification"("email");

-- CreateIndex
CREATE INDEX "hire_trainer_verification_email_idx" ON "hire_trainer_verification"("email");

-- CreateIndex
CREATE INDEX "hire_trainer_document_hireTrainerId_idx" ON "hire_trainer_document"("hireTrainerId");

-- AddForeignKey
ALTER TABLE "hire_trainer_document" ADD CONSTRAINT "hire_trainer_document_hireTrainerId_fkey" FOREIGN KEY ("hireTrainerId") REFERENCES "hire_trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
