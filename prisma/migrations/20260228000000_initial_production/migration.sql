-- =============================================================================
-- PRODUCTION INITIAL MIGRATION
-- Generated: February 28, 2026
-- Source: Verified against local database (gym_management_prod)
-- Purpose: Single unified migration for fresh prod/dev database setup
-- Contains: All ENUMs, Tables, Indexes, Foreign Keys, and Seed Data
-- =============================================================================

-- =====================================================================
-- STEP 1: CREATE ALL ENUM TYPES
-- =====================================================================

CREATE TYPE "AttendanceStatus" AS ENUM (
    'CHECKED_IN',
    'CHECKED_OUT',
    'ABSENT'
);

CREATE TYPE "CoursePackageType" AS ENUM (
    'REGULAR',
    'PT'
);

CREATE TYPE "DeviceType" AS ENUM (
    'FINGERPRINT',
    'FINGERPRINT_DOOR',
    'FACE',
    'IRIS'
);

CREATE TYPE "DiscountType" AS ENUM (
    'PERCENTAGE',
    'AMOUNT'
);

CREATE TYPE "DoorLockType" AS ENUM (
    'NONE',
    'USB_RELAY',
    'SMART_LOCK_API',
    'ESP32_HTTP',
    'ZKTECO_DEVICE'
);

CREATE TYPE "FingerPosition" AS ENUM (
    'RIGHT_THUMB',
    'RIGHT_INDEX',
    'RIGHT_MIDDLE',
    'RIGHT_RING',
    'RIGHT_LITTLE',
    'LEFT_THUMB',
    'LEFT_INDEX',
    'LEFT_MIDDLE',
    'LEFT_RING',
    'LEFT_LITTLE'
);

CREATE TYPE "GymSubscriptionRenewalType" AS ENUM (
    'NEW',
    'RENEWAL',
    'UPGRADE',
    'DOWNGRADE'
);

CREATE TYPE "IncentiveType" AS ENUM (
    'PT',
    'PROTEIN',
    'MEMBER_REFERENCE',
    'OTHERS'
);

CREATE TYPE "InquirySource" AS ENUM (
    'WALK_IN',
    'PHONE',
    'WEBSITE',
    'REFERRAL',
    'SOCIAL_MEDIA',
    'OTHER'
);

CREATE TYPE "InquiryStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'INTERESTED',
    'NOT_INTERESTED',
    'CONVERTED',
    'FOLLOW_UP'
);

CREATE TYPE "MemberType" AS ENUM (
    'REGULAR',
    'PT',
    'REGULAR_PT'
);

CREATE TYPE "PaymentFor" AS ENUM (
    'REGULAR',
    'PT'
);

CREATE TYPE "PaymentMode" AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'BANK_TRANSFER',
    'CHEQUE',
    'NET_BANKING',
    'OTHER'
);

CREATE TYPE "PaymentStatus" AS ENUM (
    'PAID',
    'PENDING',
    'PARTIAL'
);

CREATE TYPE "RenewalType" AS ENUM (
    'STANDARD',
    'EARLY',
    'LATE',
    'UPGRADE',
    'DOWNGRADE'
);

CREATE TYPE "SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE "VerificationMethod" AS ENUM (
    'FINGERPRINT',
    'MANUAL',
    'CARD',
    'FACE',
    'QR_CODE'
);

-- =====================================================================
-- STEP 2: CREATE ALL TABLES (ordered by dependency - parents first)
-- =====================================================================

-- ----- Level 0: Independent tables (no FK dependencies) -----

CREATE TABLE "Rolemaster" (
    "Id" TEXT NOT NULL,
    "rolename" TEXT NOT NULL,
    CONSTRAINT "Rolemaster_pkey" PRIMARY KEY ("Id")
);

CREATE TABLE "GymSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'INR',
    CONSTRAINT "GymSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- ----- Level 1: User (depends on Rolemaster) -----

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ----- Level 2: Gym (depends on User, GymSubscriptionPlan) -----

CREATE TABLE "Gym" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,
    "subscriptionPlanId" TEXT,
    "subscriptionStart" TIMESTAMP(3),
    "subscriptionEnd" TIMESTAMP(3),
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "mobileNo" TEXT,
    "phoneNo" TEXT,
    "gstRegNo" TEXT,
    "website" TEXT,
    "note" TEXT,
    "gymLogo" TEXT,
    "memberSize" INTEGER,
    "ownerPassword" TEXT,
    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- ----- Level 2: Other master tables -----

CREATE TABLE "enquirytypemaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "enquirytypemaster_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "paymenttypemaster" (
    "id" TEXT NOT NULL,
    "paymentTypeName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "paymenttypemaster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plancategorymaster" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "plancategorymaster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_expense_group_master" (
    "id" TEXT NOT NULL,
    "expenseGroupName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admin_expense_group_master_pkey" PRIMARY KEY ("id")
);

-- ----- Level 2: RefreshToken (depends on User) -----

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- ----- Level 2: PasswordResetHistory (depends on User) -----

CREATE TABLE "passwordresethistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT,
    "roleName" TEXT,
    "resetBy" TEXT,
    "resetMethod" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "resetByEmail" TEXT,
    "targetTable" TEXT,
    "gymId" TEXT,
    "ipAddress" TEXT,
    CONSTRAINT "passwordresethistory_pkey" PRIMARY KEY ("id")
);

-- ----- Level 2: Admin Expense Master (depends on admin_expense_group_master, User) -----

CREATE TABLE "admin_expense_master" (
    "id" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "expenseGroupId" TEXT NOT NULL,
    "description" TEXT,
    "paymentMode" "PaymentMode" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admin_expense_master_pkey" PRIMARY KEY ("id")
);

-- ----- Level 3: Trainer (depends on User, Gym) -----

CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "specialization" TEXT,
    "experience" INTEGER,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "idProofDocument" TEXT,
    "idProofType" TEXT,
    "joiningDate" TIMESTAMP(3),
    "salary" DECIMAL(10,2),
    "trainerPhoto" TEXT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- ----- Level 3: Member (depends on User, Gym) -----

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "healthNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "membershipStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membershipEnd" TIMESTAMP(3) NOT NULL,
    "membershipStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "memberType" "MemberType" NOT NULL DEFAULT 'REGULAR',
    "updatedBy" TEXT,
    "altContactNo" TEXT,
    "anniversaryDate" TIMESTAMP(3),
    "bloodGroup" TEXT,
    "idProofDocument" TEXT,
    "idProofType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maritalStatus" TEXT,
    "memberId" TEXT,
    "memberPhoto" TEXT,
    "occupation" TEXT,
    "smsFacility" BOOLEAN NOT NULL DEFAULT true,
    "afterDiscount" DECIMAL(10,2),
    "coursePackageId" TEXT,
    "extraDiscount" DECIMAL(10,2),
    "finalFees" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "packageFees" DECIMAL(10,2),
    "hasPTAddon" BOOLEAN NOT NULL DEFAULT false,
    "ptAfterDiscount" DECIMAL(10,2),
    "ptExtraDiscount" DECIMAL(10,2),
    "ptFinalFees" DECIMAL(10,2),
    "ptMaxDiscount" DECIMAL(10,2),
    "ptPackageFees" DECIMAL(10,2),
    "ptPackageName" TEXT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- ----- Level 3: Gym-related tables -----

CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "source" "InquirySource" NOT NULL DEFAULT 'WALK_IN',
    "interest" TEXT,
    "notes" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "followUpDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,
    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DietPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER,
    "meals" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gymId" TEXT NOT NULL,
    CONSTRAINT "DietPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExercisePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "exercises" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gymId" TEXT NOT NULL,
    CONSTRAINT "ExercisePlan_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "workoutexercisemaster" (
    "id" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "shortCode" VARCHAR(20),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bodyPartId" TEXT,
    CONSTRAINT "workoutexercisemaster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coursepackage" (
    "id" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "description" TEXT,
    "fees" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "coursePackageType" "CoursePackageType" NOT NULL DEFAULT 'REGULAR',
    "Months" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "coursepackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expensegroupmaster" (
    "id" TEXT NOT NULL,
    "expenseGroupName" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "expensegroupmaster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expensemaster" (
    "id" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "expenseGroupId" TEXT NOT NULL,
    "description" TEXT,
    "paymentMode" "PaymentMode" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "expensemaster_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "designationmaster" (
    "id" TEXT NOT NULL,
    "designationName" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "designationmaster_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "diettemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gymId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "diettemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dietmeal" (
    "id" TEXT NOT NULL,
    "dietTemplateId" TEXT NOT NULL,
    "mealNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dietmeal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gyminquiry" (
    "id" TEXT NOT NULL,
    "gymName" TEXT NOT NULL,
    "address1" TEXT,
    "address2" TEXT,
    "state" TEXT,
    "city" TEXT,
    "mobileNo" TEXT NOT NULL,
    "email" TEXT,
    "subscriptionPlanId" TEXT NOT NULL,
    "note" TEXT,
    "sellerName" TEXT,
    "sellerMobileNo" TEXT,
    "nextFollowupDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enquiryTypeId" TEXT,
    "memberSize" INTEGER,
    CONSTRAINT "gyminquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gyminquiryfollowup" (
    "id" TEXT NOT NULL,
    "gymInquiryId" TEXT NOT NULL,
    "followupDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gyminquiryfollowup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gymsubscriptionhistory" (
    "id" TEXT NOT NULL,
    "subscriptionNumber" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "subscriptionStart" TIMESTAMP(3) NOT NULL,
    "subscriptionEnd" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousPlanId" TEXT,
    "previousPlanName" TEXT,
    "previousSubscriptionEnd" TIMESTAMP(3),
    "renewalType" "GymSubscriptionRenewalType" NOT NULL DEFAULT 'NEW',
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMode" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "paidAmount" DECIMAL(10,2),
    "pendingAmount" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extraDiscount" DECIMAL(10,2),
    "planAmount" DECIMAL(10,2),
    CONSTRAINT "gymsubscriptionhistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trainersalarysettlement" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "trainerName" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "joiningDate" TIMESTAMP(3),
    "monthlySalary" DECIMAL(10,2) NOT NULL,
    "salaryMonth" TEXT NOT NULL,
    "salarySentDate" TIMESTAMP(3),
    "totalDaysInMonth" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL,
    "discountDays" INTEGER NOT NULL DEFAULT 0,
    "payableDays" INTEGER NOT NULL,
    "calculatedSalary" DECIMAL(10,2) NOT NULL,
    "incentiveAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "incentiveType" "IncentiveType",
    "paymentMode" "PaymentMode" NOT NULL,
    "finalPayableAmount" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "gymId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trainersalarysettlement_pkey" PRIMARY KEY ("id")
);

-- ----- Level 4: Member child tables -----

CREATE TABLE "MemberTrainerAssignment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MemberTrainerAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberDietAssignment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "dietPlanId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MemberDietAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberExerciseAssignment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "exercisePlanId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayOfWeek" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MemberExerciseAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberDietPlan" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER,
    "meals" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,
    CONSTRAINT "MemberDietPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberbalancepayment" (
    "id" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactNo" TEXT,
    "paidFees" DECIMAL(10,2) NOT NULL,
    "payMode" TEXT NOT NULL,
    "nextPaymentDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "paymentFor" "PaymentFor" NOT NULL DEFAULT 'REGULAR',
    CONSTRAINT "memberbalancepayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "membershiprenewal" (
    "id" TEXT NOT NULL,
    "renewalNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "previousMembershipStart" TIMESTAMP(3) NOT NULL,
    "previousMembershipEnd" TIMESTAMP(3) NOT NULL,
    "newMembershipStart" TIMESTAMP(3) NOT NULL,
    "newMembershipEnd" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalType" "RenewalType" NOT NULL DEFAULT 'STANDARD',
    "coursePackageId" TEXT,
    "packageFees" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "afterDiscount" DECIMAL(10,2),
    "extraDiscount" DECIMAL(10,2),
    "finalFees" DECIMAL(10,2),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMode" TEXT,
    "paidAmount" DECIMAL(10,2),
    "pendingAmount" DECIMAL(10,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "membershiprenewal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ptsessioncredit" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sessionCredits" INTEGER NOT NULL,
    "originalPackage" TEXT NOT NULL,
    "creditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "ptsessioncredit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberdiet" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "dietTemplateId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "assignedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "memberdiet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberdietmeal" (
    "id" TEXT NOT NULL,
    "memberDietId" TEXT NOT NULL,
    "mealNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "memberdietmeal_pkey" PRIMARY KEY ("id")
);

-- ----- Level 4: PTMember (depends on Member, Trainer) -----

CREATE TABLE "PTMember" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "sessionsTotal" INTEGER NOT NULL DEFAULT 0,
    "sessionsUsed" INTEGER NOT NULL DEFAULT 0,
    "sessionDuration" INTEGER NOT NULL DEFAULT 60,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "goals" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,
    CONSTRAINT "PTMember_pkey" PRIMARY KEY ("id")
);

-- ----- Level 5: Supplement (depends on PTMember) -----

CREATE TABLE "Supplement" (
    "id" TEXT NOT NULL,
    "ptMemberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "timing" TEXT,
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "gymId" TEXT NOT NULL,
    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id")
);

-- ----- Biometric Attendance Tables -----

CREATE TABLE "biometric_device" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceSerial" TEXT NOT NULL,
    "deviceModel" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'FINGERPRINT',
    "vendorId" INTEGER,
    "productId" INTEGER,
    "ipAddress" TEXT,
    "port" INTEGER,
    "doorLockType" "DoorLockType" NOT NULL DEFAULT 'NONE',
    "doorLockConfig" JSONB,
    "lastSeenAt" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "biometric_device_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "member_biometric" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "fingerTemplate1" BYTEA,
    "fingerTemplate2" BYTEA,
    "fingerPosition1" "FingerPosition",
    "fingerPosition2" "FingerPosition",
    "templateFormat" TEXT NOT NULL DEFAULT 'ISO_19794_2',
    "templateVersion" TEXT NOT NULL DEFAULT '1.0',
    "quality1" INTEGER,
    "quality2" INTEGER,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrolledBy" TEXT,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedAt" TIMESTAMP(3),
    CONSTRAINT "member_biometric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL,
    "checkOutTime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "verificationMethod" "VerificationMethod" NOT NULL,
    "verificationScore" INTEGER,
    "deviceId" TEXT,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "isManualEntry" BOOLEAN NOT NULL DEFAULT false,
    "manualEntryBy" TEXT,
    "manualEntryReason" TEXT,
    "doorUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "doorUnlockTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- =====================================================================
-- STEP 3: CREATE ALL UNIQUE INDEXES
-- =====================================================================

CREATE UNIQUE INDEX "Gym_ownerId_key" ON "Gym"("ownerId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");
CREATE UNIQUE INDEX "Trainer_userId_key" ON "Trainer"("userId");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");
CREATE UNIQUE INDEX "MemberTrainerAssignment_memberId_trainerId_key" ON "MemberTrainerAssignment"("memberId", "trainerId");
CREATE UNIQUE INDEX "PTMember_memberId_key" ON "PTMember"("memberId");
CREATE UNIQUE INDEX "occupationmaster_occupationName_key" ON "occupationmaster"("occupationName");
CREATE UNIQUE INDEX "enquirytypemaster_name_key" ON "enquirytypemaster"("name");
CREATE UNIQUE INDEX "paymenttypemaster_paymentTypeName_key" ON "paymenttypemaster"("paymentTypeName");
CREATE UNIQUE INDEX "plancategorymaster_categoryName_key" ON "plancategorymaster"("categoryName");
CREATE UNIQUE INDEX "admin_expense_group_master_expenseGroupName_key" ON "admin_expense_group_master"("expenseGroupName");
CREATE UNIQUE INDEX "bodypartmaster_bodyPartName_gymId_key" ON "bodypartmaster"("bodyPartName", "gymId");
CREATE UNIQUE INDEX "workoutexercisemaster_exerciseName_gymId_key" ON "workoutexercisemaster"("exerciseName", "gymId");
CREATE UNIQUE INDEX "coursepackage_packageName_gymId_key" ON "coursepackage"("packageName", "gymId");
CREATE UNIQUE INDEX "expensegroupmaster_expenseGroupName_gymId_key" ON "expensegroupmaster"("expenseGroupName", "gymId");
CREATE UNIQUE INDEX "designationmaster_designationName_gymId_key" ON "designationmaster"("designationName", "gymId");
CREATE UNIQUE INDEX "dietmeal_dietTemplateId_mealNo_key" ON "dietmeal"("dietTemplateId", "mealNo");
CREATE UNIQUE INDEX "memberdietmeal_memberDietId_mealNo_key" ON "memberdietmeal"("memberDietId", "mealNo");
CREATE UNIQUE INDEX "trainersalarysettlement_trainerId_salaryMonth_gymId_key" ON "trainersalarysettlement"("trainerId", "salaryMonth", "gymId");
CREATE UNIQUE INDEX "biometric_device_deviceSerial_key" ON "biometric_device"("deviceSerial");
CREATE UNIQUE INDEX "biometric_device_gymId_deviceName_key" ON "biometric_device"("gymId", "deviceName");
CREATE UNIQUE INDEX "member_biometric_memberId_key" ON "member_biometric"("memberId");
CREATE UNIQUE INDEX "attendance_memberId_attendanceDate_key" ON "attendance"("memberId", "attendanceDate");

-- =====================================================================
-- STEP 4: CREATE ALL NON-UNIQUE INDEXES
-- =====================================================================

-- GymSubscriptionPlan indexes
CREATE INDEX "GymSubscriptionPlan_isActive_idx" ON "GymSubscriptionPlan"("isActive");
CREATE INDEX "GymSubscriptionPlan_priceCurrency_idx" ON "GymSubscriptionPlan"("priceCurrency");

-- User indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- Gym indexes
CREATE INDEX "Gym_ownerId_idx" ON "Gym"("ownerId");
CREATE INDEX "Gym_city_idx" ON "Gym"("city");
CREATE INDEX "Gym_state_idx" ON "Gym"("state");
CREATE INDEX "Gym_zipcode_idx" ON "Gym"("zipcode");
CREATE INDEX "Gym_gstRegNo_idx" ON "Gym"("gstRegNo");

-- RefreshToken indexes
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- Trainer indexes
CREATE INDEX "Trainer_gymId_idx" ON "Trainer"("gymId");
CREATE INDEX "Trainer_isActive_idx" ON "Trainer"("isActive");
CREATE INDEX "Trainer_email_idx" ON "Trainer"("email");

-- Member indexes
CREATE INDEX "Member_gymId_idx" ON "Member"("gymId");
CREATE INDEX "Member_membershipStatus_idx" ON "Member"("membershipStatus");
CREATE INDEX "Member_memberType_idx" ON "Member"("memberType");
CREATE INDEX "Member_memberId_idx" ON "Member"("memberId");
CREATE INDEX "Member_isActive_idx" ON "Member"("isActive");
CREATE INDEX "Member_hasPTAddon_idx" ON "Member"("hasPTAddon");
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- Inquiry indexes
CREATE INDEX "Inquiry_gymId_idx" ON "Inquiry"("gymId");
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

-- DietPlan indexes
CREATE INDEX "DietPlan_gymId_idx" ON "DietPlan"("gymId");

-- ExercisePlan indexes
CREATE INDEX "ExercisePlan_gymId_idx" ON "ExercisePlan"("gymId");

-- Assignment indexes
CREATE INDEX "MemberTrainerAssignment_memberId_idx" ON "MemberTrainerAssignment"("memberId");
CREATE INDEX "MemberTrainerAssignment_trainerId_idx" ON "MemberTrainerAssignment"("trainerId");
CREATE INDEX "MemberDietAssignment_memberId_idx" ON "MemberDietAssignment"("memberId");
CREATE INDEX "MemberDietAssignment_dietPlanId_idx" ON "MemberDietAssignment"("dietPlanId");
CREATE INDEX "MemberExerciseAssignment_memberId_idx" ON "MemberExerciseAssignment"("memberId");
CREATE INDEX "MemberExerciseAssignment_exercisePlanId_idx" ON "MemberExerciseAssignment"("exercisePlanId");

-- MemberDietPlan indexes
CREATE INDEX "MemberDietPlan_memberId_idx" ON "MemberDietPlan"("memberId");
CREATE INDEX "MemberDietPlan_gymId_idx" ON "MemberDietPlan"("gymId");

-- PTMember indexes
CREATE INDEX "PTMember_gymId_idx" ON "PTMember"("gymId");
CREATE INDEX "PTMember_trainerId_idx" ON "PTMember"("trainerId");
CREATE INDEX "PTMember_memberId_idx" ON "PTMember"("memberId");

-- Supplement indexes
CREATE INDEX "Supplement_ptMemberId_idx" ON "Supplement"("ptMemberId");
CREATE INDEX "Supplement_gymId_idx" ON "Supplement"("gymId");

-- Master table indexes
CREATE INDEX "occupationmaster_isActive_idx" ON "occupationmaster"("isActive");
CREATE INDEX "occupationmaster_occupationName_idx" ON "occupationmaster"("occupationName");
CREATE INDEX "enquirytypemaster_isActive_idx" ON "enquirytypemaster"("isActive");
CREATE INDEX "enquirytypemaster_name_idx" ON "enquirytypemaster"("name");
CREATE INDEX "paymenttypemaster_isActive_idx" ON "paymenttypemaster"("isActive");
CREATE INDEX "paymenttypemaster_paymentTypeName_idx" ON "paymenttypemaster"("paymentTypeName");
CREATE INDEX "plancategorymaster_isActive_idx" ON "plancategorymaster"("isActive");
CREATE INDEX "plancategorymaster_categoryName_idx" ON "plancategorymaster"("categoryName");
CREATE INDEX "admin_expense_group_master_expenseGroupName_idx" ON "admin_expense_group_master"("expenseGroupName");
CREATE INDEX "admin_expense_master_expenseGroupId_idx" ON "admin_expense_master"("expenseGroupId");
CREATE INDEX "admin_expense_master_expenseDate_idx" ON "admin_expense_master"("expenseDate");
CREATE INDEX "admin_expense_master_isActive_idx" ON "admin_expense_master"("isActive");
CREATE INDEX "admin_expense_master_createdBy_idx" ON "admin_expense_master"("createdBy");

-- Gym child table indexes
CREATE INDEX "bodypartmaster_gymId_idx" ON "bodypartmaster"("gymId");
CREATE INDEX "bodypartmaster_bodyPartName_idx" ON "bodypartmaster"("bodyPartName");
CREATE INDEX "bodypartmaster_isActive_idx" ON "bodypartmaster"("isActive");
CREATE INDEX "workoutexercisemaster_gymId_idx" ON "workoutexercisemaster"("gymId");
CREATE INDEX "workoutexercisemaster_exerciseName_idx" ON "workoutexercisemaster"("exerciseName");
CREATE INDEX "workoutexercisemaster_shortCode_idx" ON "workoutexercisemaster"("shortCode");
CREATE INDEX "workoutexercisemaster_isActive_idx" ON "workoutexercisemaster"("isActive");
CREATE INDEX "workoutexercisemaster_bodyPartId_idx" ON "workoutexercisemaster"("bodyPartId");
CREATE INDEX "coursepackage_gymId_idx" ON "coursepackage"("gymId");
CREATE INDEX "coursepackage_packageName_idx" ON "coursepackage"("packageName");
CREATE INDEX "coursepackage_isActive_idx" ON "coursepackage"("isActive");
CREATE INDEX "coursepackage_coursePackageType_idx" ON "coursepackage"("coursePackageType");
CREATE INDEX "expensegroupmaster_gymId_idx" ON "expensegroupmaster"("gymId");
CREATE INDEX "expensegroupmaster_expenseGroupName_idx" ON "expensegroupmaster"("expenseGroupName");
CREATE INDEX "expensemaster_gymId_idx" ON "expensemaster"("gymId");
CREATE INDEX "expensemaster_expenseGroupId_idx" ON "expensemaster"("expenseGroupId");
CREATE INDEX "expensemaster_expenseDate_idx" ON "expensemaster"("expenseDate");
CREATE INDEX "expensemaster_isActive_idx" ON "expensemaster"("isActive");
CREATE INDEX "expensemaster_createdBy_idx" ON "expensemaster"("createdBy");
CREATE INDEX "designationmaster_gymId_idx" ON "designationmaster"("gymId");
CREATE INDEX "designationmaster_designationName_idx" ON "designationmaster"("designationName");
CREATE INDEX "memberinquiry_gymId_idx" ON "memberinquiry"("gymId");
CREATE INDEX "memberinquiry_userId_idx" ON "memberinquiry"("userId");
CREATE INDEX "memberinquiry_contactNo_idx" ON "memberinquiry"("contactNo");
CREATE INDEX "memberinquiry_inquiryDate_idx" ON "memberinquiry"("inquiryDate");
CREATE INDEX "memberinquiry_followUp_idx" ON "memberinquiry"("followUp");
CREATE INDEX "memberinquiry_isActive_idx" ON "memberinquiry"("isActive");

-- Diet template indexes
CREATE INDEX "diettemplate_gymId_idx" ON "diettemplate"("gymId");
CREATE INDEX "diettemplate_createdBy_idx" ON "diettemplate"("createdBy");
CREATE INDEX "diettemplate_isActive_idx" ON "diettemplate"("isActive");
CREATE INDEX "dietmeal_dietTemplateId_idx" ON "dietmeal"("dietTemplateId");

-- Member diet indexes
CREATE INDEX "memberdiet_memberId_idx" ON "memberdiet"("memberId");
CREATE INDEX "memberdiet_gymId_idx" ON "memberdiet"("gymId");
CREATE INDEX "memberdiet_dietTemplateId_idx" ON "memberdiet"("dietTemplateId");
CREATE INDEX "memberdiet_assignedBy_idx" ON "memberdiet"("assignedBy");
CREATE INDEX "memberdiet_isActive_idx" ON "memberdiet"("isActive");
CREATE INDEX "memberdiet_startDate_idx" ON "memberdiet"("startDate");
CREATE INDEX "memberdietmeal_memberDietId_idx" ON "memberdietmeal"("memberDietId");

-- Balance payment indexes
CREATE INDEX "memberbalancepayment_memberId_idx" ON "memberbalancepayment"("memberId");
CREATE INDEX "memberbalancepayment_gymId_idx" ON "memberbalancepayment"("gymId");
CREATE INDEX "memberbalancepayment_receiptNo_idx" ON "memberbalancepayment"("receiptNo");
CREATE INDEX "memberbalancepayment_paymentDate_idx" ON "memberbalancepayment"("paymentDate");
CREATE INDEX "memberbalancepayment_paymentFor_idx" ON "memberbalancepayment"("paymentFor");

-- Membership renewal indexes
CREATE INDEX "membershiprenewal_memberId_idx" ON "membershiprenewal"("memberId");
CREATE INDEX "membershiprenewal_gymId_idx" ON "membershiprenewal"("gymId");
CREATE INDEX "membershiprenewal_renewalNumber_idx" ON "membershiprenewal"("renewalNumber");
CREATE INDEX "membershiprenewal_renewalDate_idx" ON "membershiprenewal"("renewalDate");
CREATE INDEX "membershiprenewal_paymentStatus_idx" ON "membershiprenewal"("paymentStatus");

-- PT session credit indexes
CREATE INDEX "ptsessioncredit_memberId_idx" ON "ptsessioncredit"("memberId");
CREATE INDEX "ptsessioncredit_gymId_idx" ON "ptsessioncredit"("gymId");
CREATE INDEX "ptsessioncredit_expiryDate_idx" ON "ptsessioncredit"("expiryDate");
CREATE INDEX "ptsessioncredit_isActive_idx" ON "ptsessioncredit"("isActive");

-- Password reset history indexes
CREATE INDEX "passwordresethistory_userId_idx" ON "passwordresethistory"("userId");
CREATE INDEX "passwordresethistory_email_idx" ON "passwordresethistory"("email");
CREATE INDEX "passwordresethistory_roleId_idx" ON "passwordresethistory"("roleId");
CREATE INDEX "passwordresethistory_roleName_idx" ON "passwordresethistory"("roleName");
CREATE INDEX "passwordresethistory_gymId_idx" ON "passwordresethistory"("gymId");
CREATE INDEX "passwordresethistory_createdAt_idx" ON "passwordresethistory"("createdAt");

-- Gym inquiry indexes
CREATE INDEX "gyminquiry_isActive_idx" ON "gyminquiry"("isActive");
CREATE INDEX "gyminquiry_subscriptionPlanId_idx" ON "gyminquiry"("subscriptionPlanId");
CREATE INDEX "gyminquiry_nextFollowupDate_idx" ON "gyminquiry"("nextFollowupDate");
CREATE INDEX "gyminquiry_enquiryTypeId_idx" ON "gyminquiry"("enquiryTypeId");
CREATE INDEX "gyminquiryfollowup_gymInquiryId_idx" ON "gyminquiryfollowup"("gymInquiryId");
CREATE INDEX "gyminquiryfollowup_followupDate_idx" ON "gyminquiryfollowup"("followupDate");

-- Gym subscription history indexes
CREATE INDEX "gymsubscriptionhistory_gymId_idx" ON "gymsubscriptionhistory"("gymId");
CREATE INDEX "gymsubscriptionhistory_subscriptionPlanId_idx" ON "gymsubscriptionhistory"("subscriptionPlanId");
CREATE INDEX "gymsubscriptionhistory_isActive_idx" ON "gymsubscriptionhistory"("isActive");
CREATE INDEX "gymsubscriptionhistory_subscriptionNumber_idx" ON "gymsubscriptionhistory"("subscriptionNumber");
CREATE INDEX "gymsubscriptionhistory_renewalDate_idx" ON "gymsubscriptionhistory"("renewalDate");
CREATE INDEX "gymsubscriptionhistory_paymentStatus_idx" ON "gymsubscriptionhistory"("paymentStatus");

-- Trainer salary settlement indexes
CREATE INDEX "trainersalarysettlement_gymId_idx" ON "trainersalarysettlement"("gymId");
CREATE INDEX "trainersalarysettlement_trainerId_idx" ON "trainersalarysettlement"("trainerId");
CREATE INDEX "trainersalarysettlement_salaryMonth_idx" ON "trainersalarysettlement"("salaryMonth");
CREATE INDEX "trainersalarysettlement_createdAt_idx" ON "trainersalarysettlement"("createdAt");
CREATE INDEX "trainersalarysettlement_paymentMode_idx" ON "trainersalarysettlement"("paymentMode");

-- Biometric device indexes
CREATE INDEX "biometric_device_gymId_idx" ON "biometric_device"("gymId");
CREATE INDEX "biometric_device_isActive_idx" ON "biometric_device"("isActive");
CREATE INDEX "biometric_device_deviceType_idx" ON "biometric_device"("deviceType");

-- Member biometric indexes
CREATE INDEX "member_biometric_memberId_idx" ON "member_biometric"("memberId");
CREATE INDEX "member_biometric_gymId_idx" ON "member_biometric"("gymId");
CREATE INDEX "member_biometric_isActive_idx" ON "member_biometric"("isActive");

-- Attendance indexes
CREATE INDEX "attendance_memberId_idx" ON "attendance"("memberId");
CREATE INDEX "attendance_gymId_idx" ON "attendance"("gymId");
CREATE INDEX "attendance_attendanceDate_idx" ON "attendance"("attendanceDate");
CREATE INDEX "attendance_gymId_attendanceDate_idx" ON "attendance"("gymId", "attendanceDate");
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- =====================================================================
-- STEP 5: CREATE ALL FOREIGN KEY CONSTRAINTS
-- =====================================================================

-- User -> Rolemaster
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Rolemaster"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RefreshToken -> User
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gym -> User, GymSubscriptionPlan
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "GymSubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Trainer -> User, Gym
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Member -> User, Gym
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Member" ADD CONSTRAINT "Member_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DietPlan, ExercisePlan -> Gym
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExercisePlan" ADD CONSTRAINT "ExercisePlan_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Assignments -> Member, Trainer, DietPlan, ExercisePlan
ALTER TABLE "MemberTrainerAssignment" ADD CONSTRAINT "MemberTrainerAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberTrainerAssignment" ADD CONSTRAINT "MemberTrainerAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDietAssignment" ADD CONSTRAINT "MemberDietAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDietAssignment" ADD CONSTRAINT "MemberDietAssignment_dietPlanId_fkey" FOREIGN KEY ("dietPlanId") REFERENCES "DietPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberExerciseAssignment" ADD CONSTRAINT "MemberExerciseAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberExerciseAssignment" ADD CONSTRAINT "MemberExerciseAssignment_exercisePlanId_fkey" FOREIGN KEY ("exercisePlanId") REFERENCES "ExercisePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MemberDietPlan -> Member
ALTER TABLE "MemberDietPlan" ADD CONSTRAINT "MemberDietPlan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PTMember -> Member, Trainer
ALTER TABLE "PTMember" ADD CONSTRAINT "PTMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PTMember" ADD CONSTRAINT "PTMember_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supplement -> PTMember
ALTER TABLE "Supplement" ADD CONSTRAINT "Supplement_ptMemberId_fkey" FOREIGN KEY ("ptMemberId") REFERENCES "PTMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Balance payments & renewals -> Member
ALTER TABLE "memberbalancepayment" ADD CONSTRAINT "memberbalancepayment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "membershiprenewal" ADD CONSTRAINT "membershiprenewal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ptsessioncredit" ADD CONSTRAINT "ptsessioncredit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gym child tables -> Gym
ALTER TABLE "bodypartmaster" ADD CONSTRAINT "bodypartmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workoutexercisemaster" ADD CONSTRAINT "workoutexercisemaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workoutexercisemaster" ADD CONSTRAINT "workoutexercisemaster_bodyPartId_fkey" FOREIGN KEY ("bodyPartId") REFERENCES "bodypartmaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coursepackage" ADD CONSTRAINT "coursepackage_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expensegroupmaster" ADD CONSTRAINT "expensegroupmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expensemaster" ADD CONSTRAINT "expensemaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expensemaster" ADD CONSTRAINT "expensemaster_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "expensegroupmaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "designationmaster" ADD CONSTRAINT "designationmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberinquiry" ADD CONSTRAINT "memberinquiry_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberinquiry" ADD CONSTRAINT "memberinquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Diet template -> Gym, User
ALTER TABLE "diettemplate" ADD CONSTRAINT "diettemplate_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "diettemplate" ADD CONSTRAINT "diettemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dietmeal" ADD CONSTRAINT "dietmeal_dietTemplateId_fkey" FOREIGN KEY ("dietTemplateId") REFERENCES "diettemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Member diet -> Member, diettemplate, Gym, User
ALTER TABLE "memberdiet" ADD CONSTRAINT "memberdiet_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberdiet" ADD CONSTRAINT "memberdiet_dietTemplateId_fkey" FOREIGN KEY ("dietTemplateId") REFERENCES "diettemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "memberdiet" ADD CONSTRAINT "memberdiet_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberdiet" ADD CONSTRAINT "memberdiet_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "memberdietmeal" ADD CONSTRAINT "memberdietmeal_memberDietId_fkey" FOREIGN KEY ("memberDietId") REFERENCES "memberdiet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Password reset history -> User
ALTER TABLE "passwordresethistory" ADD CONSTRAINT "passwordresethistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Admin expense master -> admin_expense_group_master, User
ALTER TABLE "admin_expense_master" ADD CONSTRAINT "admin_expense_master_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "admin_expense_group_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_expense_master" ADD CONSTRAINT "admin_expense_master_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gym inquiry -> GymSubscriptionPlan, enquirytypemaster
ALTER TABLE "gyminquiry" ADD CONSTRAINT "gyminquiry_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "GymSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gyminquiry" ADD CONSTRAINT "gyminquiry_enquiryTypeId_fkey" FOREIGN KEY ("enquiryTypeId") REFERENCES "enquirytypemaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "gyminquiryfollowup" ADD CONSTRAINT "gyminquiryfollowup_gymInquiryId_fkey" FOREIGN KEY ("gymInquiryId") REFERENCES "gyminquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gym subscription history -> Gym, GymSubscriptionPlan
ALTER TABLE "gymsubscriptionhistory" ADD CONSTRAINT "gymsubscriptionhistory_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gymsubscriptionhistory" ADD CONSTRAINT "gymsubscriptionhistory_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "GymSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Trainer salary settlement -> Trainer, Gym
ALTER TABLE "trainersalarysettlement" ADD CONSTRAINT "trainersalarysettlement_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trainersalarysettlement" ADD CONSTRAINT "trainersalarysettlement_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Biometric tables -> Gym, Member, User, BiometricDevice
ALTER TABLE "biometric_device" ADD CONSTRAINT "biometric_device_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_biometric" ADD CONSTRAINT "member_biometric_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_biometric" ADD CONSTRAINT "member_biometric_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_biometric" ADD CONSTRAINT "member_biometric_enrolledBy_fkey" FOREIGN KEY ("enrolledBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "biometric_device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================
-- STEP 6: INSERT DEFAULT SEED DATA
-- Required data for the system to function properly
-- =====================================================================

-- 6.1: Roles (ADMIN, GYM_OWNER, MEMBER, TRAINER)
INSERT INTO "Rolemaster" ("Id", "rolename") VALUES ('27d5fc58-dbe2-4860-8810-245f3cb55ac5', 'ADMIN');
INSERT INTO "Rolemaster" ("Id", "rolename") VALUES ('0a77af10-b53a-4aa3-b914-ae5b8ed26d5e', 'GYM_OWNER');
INSERT INTO "Rolemaster" ("Id", "rolename") VALUES ('01ad1313-01cb-4098-a74e-d01a3b106f8c', 'MEMBER');
INSERT INTO "Rolemaster" ("Id", "rolename") VALUES ('016bd713-e0fa-4e24-91d9-ba3ae18cd7a9', 'TRAINER');

-- 6.2: Admin User (admin@gymmanager.com / admin123)
-- Password hash is bcrypt of 'admin123'
INSERT INTO "User" ("id", "email", "password", "name", "isActive", "createdAt", "updatedAt", "roleId")
VALUES ('aecdeaa0-fa61-4196-b15f-656312bcd5dd', 'admin@gymmanager.com', '$2a$10$.clgxvuGqDydKSpnTlltQu7DSViVSVtR4GvinCY7XICd7B/zsKAOa', 'System Admin', true, '2026-01-04 10:57:51.551', '2026-01-04 10:57:51.551', '27d5fc58-dbe2-4860-8810-245f3cb55ac5');

-- 6.3: Enquiry Types
INSERT INTO "enquirytypemaster" ("id", "name", "isActive", "createdAt", "updatedAt", "createdBy") VALUES ('096ebf92-770a-4671-8a96-f279a494a2a7', 'Telephonic', true, '2026-01-01 11:06:22.337', '2026-01-01 11:06:22.337', NULL);
INSERT INTO "enquirytypemaster" ("id", "name", "isActive", "createdAt", "updatedAt", "createdBy") VALUES ('da78fe4d-4b88-4c15-b23d-e6b9dbe48224', 'Walkin', true, '2026-01-01 11:06:30.345', '2026-01-01 11:06:30.345', NULL);
INSERT INTO "enquirytypemaster" ("id", "name", "isActive", "createdAt", "updatedAt", "createdBy") VALUES ('6880e56f-eb5b-4b01-a7d2-97af87cddf6f', 'Others', true, '2026-01-01 11:06:34.776', '2026-01-01 11:06:34.776', NULL);

-- 6.4: Admin Expense Groups
INSERT INTO "admin_expense_group_master" ("id", "expenseGroupName", "createdAt", "updatedAt") VALUES ('088cea29-2e67-4302-abc7-c909ee3c0dae', 'AI Tools', '2026-02-14 08:40:17.509', '2026-02-14 08:40:17.509');
INSERT INTO "admin_expense_group_master" ("id", "expenseGroupName", "createdAt", "updatedAt") VALUES ('582d03b0-9e7a-4e74-b512-9031d5304a03', 'Foods & Tea', '2026-02-14 08:42:23.231', '2026-02-14 08:42:23.231');
INSERT INTO "admin_expense_group_master" ("id", "expenseGroupName", "createdAt", "updatedAt") VALUES ('c98d7a96-7400-45fa-a467-d052858adf1f', 'Instrastrcutures', '2026-02-14 08:40:26.745', '2026-02-14 08:40:26.745');
INSERT INTO "admin_expense_group_master" ("id", "expenseGroupName", "createdAt", "updatedAt") VALUES ('224a944d-6e15-4074-9e31-1a876c906b1f', 'Marketings', '2026-02-14 08:40:35.073', '2026-02-14 08:40:35.073');
INSERT INTO "admin_expense_group_master" ("id", "expenseGroupName", "createdAt", "updatedAt") VALUES ('436c0bee-e669-4b71-954b-ef6a5310745d', 'Salary', '2026-02-14 08:40:44.778', '2026-02-14 08:40:44.778');

-- NOTE: GymSubscriptionPlan data should be inserted via the seed.js script
-- because the description/features fields contain large HTML with special characters
-- that are better handled by the Prisma seeder.
-- Run: npx prisma db seed

-- =============================================================================
-- END OF PRODUCTION INITIAL MIGRATION
-- =============================================================================
