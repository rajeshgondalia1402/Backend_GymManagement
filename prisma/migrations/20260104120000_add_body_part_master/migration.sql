-- CreateTable: BodyPartMaster for grouping exercises by body part
CREATE TABLE "bodypartmaster" (
    "id" TEXT NOT NULL,
    "bodyPartName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bodypartmaster_pkey" PRIMARY KEY ("id")
);

-- Add bodyPartId column to workoutexercisemaster
ALTER TABLE "workoutexercisemaster" ADD COLUMN "bodyPartId" TEXT;

-- CreateIndex
CREATE INDEX "bodypartmaster_gymId_idx" ON "bodypartmaster"("gymId");
CREATE INDEX "bodypartmaster_bodyPartName_idx" ON "bodypartmaster"("bodyPartName");
CREATE INDEX "bodypartmaster_isActive_idx" ON "bodypartmaster"("isActive");
CREATE UNIQUE INDEX "bodypartmaster_bodyPartName_gymId_key" ON "bodypartmaster"("bodyPartName", "gymId");

-- CreateIndex for workoutexercisemaster
CREATE INDEX "workoutexercisemaster_bodyPartId_idx" ON "workoutexercisemaster"("bodyPartId");

-- AddForeignKey
ALTER TABLE "bodypartmaster" ADD CONSTRAINT "bodypartmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workoutexercisemaster" ADD CONSTRAINT "workoutexercisemaster_bodyPartId_fkey" FOREIGN KEY ("bodyPartId") REFERENCES "bodypartmaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
