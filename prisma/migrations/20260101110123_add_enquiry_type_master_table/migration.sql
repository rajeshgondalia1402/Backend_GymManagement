-- CreateTable
CREATE TABLE "enquirytypemaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "enquirytypemaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enquirytypemaster_name_key" ON "enquirytypemaster"("name");

-- CreateIndex
CREATE INDEX "enquirytypemaster_isActive_idx" ON "enquirytypemaster"("isActive");

-- CreateIndex
CREATE INDEX "enquirytypemaster_name_idx" ON "enquirytypemaster"("name");
