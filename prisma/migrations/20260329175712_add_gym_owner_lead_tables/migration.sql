-- CreateTable
CREATE TABLE "gym_owner_lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gymName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_owner_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_owner_lead_verification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_owner_lead_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gym_owner_lead_email_key" ON "gym_owner_lead"("email");

-- CreateIndex
CREATE INDEX "gym_owner_lead_email_idx" ON "gym_owner_lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gym_owner_lead_verification_email_key" ON "gym_owner_lead_verification"("email");

-- CreateIndex
CREATE INDEX "gym_owner_lead_verification_email_idx" ON "gym_owner_lead_verification"("email");
