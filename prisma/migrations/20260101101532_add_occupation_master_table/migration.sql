-- CreateTable
CREATE TABLE "occupationmaster" (
    "id" TEXT NOT NULL,
    "occupationName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "occupationmaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "occupationmaster_occupationName_key" ON "occupationmaster"("occupationName");

-- CreateIndex
CREATE INDEX "occupationmaster_isActive_idx" ON "occupationmaster"("isActive");

-- CreateIndex
CREATE INDEX "occupationmaster_occupationName_idx" ON "occupationmaster"("occupationName");
