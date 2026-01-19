-- CreateTable
CREATE TABLE "memberinquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "inquiryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dob" TIMESTAMP(3),
    "followUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "heardAbout" TEXT,
    "userId" TEXT NOT NULL,
    "comments" TEXT,
    "memberPhoto" TEXT,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "referenceName" TEXT,
    "gymId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "memberinquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memberinquiry_gymId_idx" ON "memberinquiry"("gymId");

-- CreateIndex
CREATE INDEX "memberinquiry_userId_idx" ON "memberinquiry"("userId");

-- CreateIndex
CREATE INDEX "memberinquiry_contactNo_idx" ON "memberinquiry"("contactNo");

-- CreateIndex
CREATE INDEX "memberinquiry_inquiryDate_idx" ON "memberinquiry"("inquiryDate");

-- CreateIndex
CREATE INDEX "memberinquiry_followUp_idx" ON "memberinquiry"("followUp");

-- CreateIndex
CREATE INDEX "memberinquiry_isActive_idx" ON "memberinquiry"("isActive");

-- AddForeignKey
ALTER TABLE "memberinquiry" ADD CONSTRAINT "memberinquiry_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberinquiry" ADD CONSTRAINT "memberinquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
