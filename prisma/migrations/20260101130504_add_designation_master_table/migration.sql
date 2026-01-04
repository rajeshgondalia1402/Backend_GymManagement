-- CreateTable
CREATE TABLE "designationmaster" (
    "id" TEXT NOT NULL,
    "designationName" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designationmaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "designationmaster_gymId_idx" ON "designationmaster"("gymId");

-- CreateIndex
CREATE INDEX "designationmaster_designationName_idx" ON "designationmaster"("designationName");

-- CreateIndex
CREATE UNIQUE INDEX "designationmaster_designationName_gymId_key" ON "designationmaster"("designationName", "gymId");

-- AddForeignKey
ALTER TABLE "designationmaster" ADD CONSTRAINT "designationmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
