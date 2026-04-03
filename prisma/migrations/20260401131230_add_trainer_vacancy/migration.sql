-- CreateEnum
CREATE TYPE "VacancySalaryType" AS ENUM ('PER_MONTH', 'PER_YEAR');

-- CreateEnum
CREATE TYPE "TrainerVacancyStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "trainer_vacancy" (
    "id" TEXT NOT NULL,
    "gymOwnerLeadId" TEXT NOT NULL,
    "role" "HireTrainerRole" NOT NULL,
    "yearsOfExperience" INTEGER,
    "ptClientExperience" INTEGER,
    "description" TEXT,
    "specialization" TEXT,
    "certificate" TEXT,
    "isPTTrainer" BOOLEAN NOT NULL DEFAULT false,
    "howSoonCanJoin" TEXT,
    "salaryMin" DECIMAL(10,2),
    "salaryMax" DECIMAL(10,2),
    "salaryType" "VacancySalaryType" NOT NULL DEFAULT 'PER_MONTH',
    "country" TEXT NOT NULL DEFAULT 'India',
    "state" TEXT,
    "city" TEXT,
    "closeDate" TIMESTAMP(3),
    "status" "TrainerVacancyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trainer_vacancy_gymOwnerLeadId_idx" ON "trainer_vacancy"("gymOwnerLeadId");

-- CreateIndex
CREATE INDEX "trainer_vacancy_status_idx" ON "trainer_vacancy"("status");

-- CreateIndex
CREATE INDEX "trainer_vacancy_role_idx" ON "trainer_vacancy"("role");

-- CreateIndex
CREATE INDEX "trainer_vacancy_state_idx" ON "trainer_vacancy"("state");

-- CreateIndex
CREATE INDEX "trainer_vacancy_city_idx" ON "trainer_vacancy"("city");

-- AddForeignKey
ALTER TABLE "trainer_vacancy" ADD CONSTRAINT "trainer_vacancy_gymOwnerLeadId_fkey" FOREIGN KEY ("gymOwnerLeadId") REFERENCES "gym_owner_lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
