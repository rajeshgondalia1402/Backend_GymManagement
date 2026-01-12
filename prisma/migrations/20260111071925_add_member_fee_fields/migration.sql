-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "afterDiscount" DECIMAL(10,2),
ADD COLUMN     "coursePackageId" TEXT,
ADD COLUMN     "extraDiscount" DECIMAL(10,2),
ADD COLUMN     "finalFees" DECIMAL(10,2),
ADD COLUMN     "maxDiscount" DECIMAL(10,2),
ADD COLUMN     "packageFees" DECIMAL(10,2);
