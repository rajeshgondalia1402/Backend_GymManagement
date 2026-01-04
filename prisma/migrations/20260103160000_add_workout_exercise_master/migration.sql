-- CreateTable
CREATE TABLE "workoutexercisemaster" (
    "id" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "shortCode" VARCHAR(20),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workoutexercisemaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workoutexercisemaster_gymId_idx" ON "workoutexercisemaster"("gymId");

-- CreateIndex
CREATE INDEX "workoutexercisemaster_exerciseName_idx" ON "workoutexercisemaster"("exerciseName");

-- CreateIndex
CREATE INDEX "workoutexercisemaster_shortCode_idx" ON "workoutexercisemaster"("shortCode");

-- CreateIndex
CREATE INDEX "workoutexercisemaster_isActive_idx" ON "workoutexercisemaster"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workoutexercisemaster_exerciseName_gymId_key" ON "workoutexercisemaster"("exerciseName", "gymId");

-- AddForeignKey
ALTER TABLE "workoutexercisemaster" ADD CONSTRAINT "workoutexercisemaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
