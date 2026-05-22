-- CreateTable
CREATE TABLE "biometric_test" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometric_test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "biometric_test_memberId_idx" ON "biometric_test"("memberId");
