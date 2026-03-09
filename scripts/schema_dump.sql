--
-- PostgreSQL database dump
--

\restrict asgc27FGvW3EwKOn7ir83ch8O7sMehbWiKFbZAd5OfgMXUoUTG3Co2inf6CIDlc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'CHECKED_IN',
    'CHECKED_OUT',
    'ABSENT'
);


--
-- Name: CoursePackageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CoursePackageType" AS ENUM (
    'REGULAR',
    'PT'
);


--
-- Name: DeviceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DeviceType" AS ENUM (
    'FINGERPRINT',
    'FINGERPRINT_DOOR',
    'FACE',
    'IRIS'
);


--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'AMOUNT'
);


--
-- Name: DoorLockType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DoorLockType" AS ENUM (
    'NONE',
    'USB_RELAY',
    'SMART_LOCK_API',
    'ESP32_HTTP',
    'ZKTECO_DEVICE'
);


--
-- Name: FingerPosition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FingerPosition" AS ENUM (
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


--
-- Name: GymSubscriptionRenewalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GymSubscriptionRenewalType" AS ENUM (
    'NEW',
    'RENEWAL',
    'UPGRADE',
    'DOWNGRADE'
);


--
-- Name: IncentiveType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IncentiveType" AS ENUM (
    'PT',
    'PROTEIN',
    'MEMBER_REFERENCE',
    'OTHERS'
);


--
-- Name: InquirySource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InquirySource" AS ENUM (
    'WALK_IN',
    'PHONE',
    'WEBSITE',
    'REFERRAL',
    'SOCIAL_MEDIA',
    'OTHER'
);


--
-- Name: InquiryStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InquiryStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'INTERESTED',
    'NOT_INTERESTED',
    'CONVERTED',
    'FOLLOW_UP'
);


--
-- Name: MemberType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MemberType" AS ENUM (
    'REGULAR',
    'PT',
    'REGULAR_PT'
);


--
-- Name: PaymentFor; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentFor" AS ENUM (
    'REGULAR',
    'PT'
);


--
-- Name: PaymentMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMode" AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'BANK_TRANSFER',
    'CHEQUE',
    'NET_BANKING',
    'OTHER'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PAID',
    'PENDING',
    'PARTIAL'
);


--
-- Name: RenewalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RenewalType" AS ENUM (
    'STANDARD',
    'EARLY',
    'LATE',
    'UPGRADE',
    'DOWNGRADE'
);


--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: VerificationMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationMethod" AS ENUM (
    'FINGERPRINT',
    'MANUAL',
    'CARD',
    'FACE',
    'QR_CODE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: DietPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DietPlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    calories integer,
    meals jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "gymId" text NOT NULL
);


--
-- Name: ExercisePlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExercisePlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text,
    exercises jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "gymId" text NOT NULL
);


--
-- Name: Gym; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Gym" (
    id text NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    email text,
    logo text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ownerId" text,
    "subscriptionPlanId" text,
    "subscriptionStart" timestamp(3) without time zone,
    "subscriptionEnd" timestamp(3) without time zone,
    address1 text,
    address2 text,
    city text,
    state text,
    zipcode text,
    "mobileNo" text,
    "phoneNo" text,
    "gstRegNo" text,
    website text,
    note text,
    "gymLogo" text,
    "memberSize" integer,
    "ownerPassword" text
);


--
-- Name: GymSubscriptionPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GymSubscriptionPlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "durationDays" integer NOT NULL,
    features text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "priceCurrency" text DEFAULT 'INR'::text NOT NULL
);


--
-- Name: Inquiry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inquiry" (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    source public."InquirySource" DEFAULT 'WALK_IN'::public."InquirySource" NOT NULL,
    interest text,
    notes text,
    status public."InquiryStatus" DEFAULT 'NEW'::public."InquiryStatus" NOT NULL,
    "followUpDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "gymId" text NOT NULL
);


--
-- Name: Member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Member" (
    id text NOT NULL,
    phone text,
    "dateOfBirth" timestamp(3) without time zone,
    gender text,
    address text,
    "emergencyContact" text,
    "healthNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "gymId" text NOT NULL,
    "membershipStart" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "membershipEnd" timestamp(3) without time zone NOT NULL,
    "membershipStatus" public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "createdBy" text,
    "memberType" public."MemberType" DEFAULT 'REGULAR'::public."MemberType" NOT NULL,
    "updatedBy" text,
    "altContactNo" text,
    "anniversaryDate" timestamp(3) without time zone,
    "bloodGroup" text,
    "idProofDocument" text,
    "idProofType" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "maritalStatus" text,
    "memberId" text,
    "memberPhoto" text,
    occupation text,
    "smsFacility" boolean DEFAULT true NOT NULL,
    "afterDiscount" numeric(10,2),
    "coursePackageId" text,
    "extraDiscount" numeric(10,2),
    "finalFees" numeric(10,2),
    "maxDiscount" numeric(10,2),
    "packageFees" numeric(10,2),
    "hasPTAddon" boolean DEFAULT false NOT NULL,
    "ptAfterDiscount" numeric(10,2),
    "ptExtraDiscount" numeric(10,2),
    "ptFinalFees" numeric(10,2),
    "ptMaxDiscount" numeric(10,2),
    "ptPackageFees" numeric(10,2),
    "ptPackageName" text,
    name text,
    email text,
    password text
);


--
-- Name: MemberDietAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MemberDietAssignment" (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "dietPlanId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: MemberDietPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MemberDietPlan" (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "planName" text NOT NULL,
    description text,
    calories integer,
    meals jsonb NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "gymId" text NOT NULL
);


--
-- Name: MemberExerciseAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MemberExerciseAssignment" (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "exercisePlanId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dayOfWeek" integer,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: MemberTrainerAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MemberTrainerAssignment" (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "trainerId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: PTMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PTMember" (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "trainerId" text NOT NULL,
    "packageName" text NOT NULL,
    "sessionsTotal" integer DEFAULT 0 NOT NULL,
    "sessionsUsed" integer DEFAULT 0 NOT NULL,
    "sessionDuration" integer DEFAULT 60 NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    goals text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "gymId" text NOT NULL
);


--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Rolemaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Rolemaster" (
    "Id" text NOT NULL,
    rolename text NOT NULL
);


--
-- Name: Supplement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Supplement" (
    id text NOT NULL,
    "ptMemberId" text NOT NULL,
    name text NOT NULL,
    dosage text,
    frequency text,
    timing text,
    notes text,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "gymId" text NOT NULL
);


--
-- Name: Trainer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Trainer" (
    id text NOT NULL,
    specialization text,
    experience integer,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "gymId" text NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "dateOfBirth" timestamp(3) without time zone,
    gender text,
    "idProofDocument" text,
    "idProofType" text,
    "joiningDate" timestamp(3) without time zone,
    salary numeric(10,2),
    "trainerPhoto" text,
    name text,
    email text,
    password text
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: admin_expense_group_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_expense_group_master (
    id text NOT NULL,
    "expenseGroupName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: admin_expense_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_expense_master (
    id text NOT NULL,
    "expenseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text NOT NULL,
    "expenseGroupId" text NOT NULL,
    description text,
    "paymentMode" public."PaymentMode" NOT NULL,
    amount numeric(10,2) NOT NULL,
    attachments text[] DEFAULT ARRAY[]::text[],
    "createdBy" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "gymId" text NOT NULL,
    "attendanceDate" date NOT NULL,
    "checkInTime" timestamp(3) without time zone NOT NULL,
    "checkOutTime" timestamp(3) without time zone,
    "durationMinutes" integer,
    "verificationMethod" public."VerificationMethod" NOT NULL,
    "verificationScore" integer,
    "deviceId" text,
    status public."AttendanceStatus" DEFAULT 'CHECKED_IN'::public."AttendanceStatus" NOT NULL,
    "isManualEntry" boolean DEFAULT false NOT NULL,
    "manualEntryBy" text,
    "manualEntryReason" text,
    "doorUnlocked" boolean DEFAULT false NOT NULL,
    "doorUnlockTime" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: biometric_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biometric_device (
    id text NOT NULL,
    "gymId" text NOT NULL,
    "deviceName" text NOT NULL,
    "deviceSerial" text NOT NULL,
    "deviceModel" text NOT NULL,
    "deviceType" public."DeviceType" DEFAULT 'FINGERPRINT'::public."DeviceType" NOT NULL,
    "vendorId" integer,
    "productId" integer,
    "ipAddress" text,
    port integer,
    "doorLockType" public."DoorLockType" DEFAULT 'NONE'::public."DoorLockType" NOT NULL,
    "doorLockConfig" jsonb,
    "lastSeenAt" timestamp(3) without time zone,
    "isOnline" boolean DEFAULT false NOT NULL,
    location text,
    "isActive" boolean DEFAULT true NOT NULL,
    "registeredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "registeredBy" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: bodypartmaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bodypartmaster (
    id text NOT NULL,
    "bodyPartName" text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: coursepackage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coursepackage (
    id text NOT NULL,
    "packageName" text NOT NULL,
    description text,
    fees numeric(10,2) NOT NULL,
    "maxDiscount" numeric(10,2),
    "discountType" public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "coursePackageType" public."CoursePackageType" DEFAULT 'REGULAR'::public."CoursePackageType" NOT NULL,
    "Months" integer DEFAULT 1 NOT NULL
);


--
-- Name: designationmaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designationmaster (
    id text NOT NULL,
    "designationName" text NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: dietmeal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dietmeal (
    id text NOT NULL,
    "dietTemplateId" text NOT NULL,
    "mealNo" integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "time" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: diettemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diettemplate (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "gymId" text NOT NULL,
    "createdBy" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: enquirytypemaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enquirytypemaster (
    id text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- Name: expensegroupmaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expensegroupmaster (
    id text NOT NULL,
    "expenseGroupName" text NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: expensemaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expensemaster (
    id text NOT NULL,
    "expenseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text NOT NULL,
    "expenseGroupId" text NOT NULL,
    description text,
    "paymentMode" public."PaymentMode" NOT NULL,
    amount numeric(10,2) NOT NULL,
    attachments text[] DEFAULT ARRAY[]::text[],
    "createdBy" text NOT NULL,
    "gymId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: gyminquiry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gyminquiry (
    id text NOT NULL,
    "gymName" text NOT NULL,
    address1 text,
    address2 text,
    state text,
    city text,
    "mobileNo" text NOT NULL,
    email text,
    "subscriptionPlanId" text NOT NULL,
    note text,
    "sellerName" text,
    "sellerMobileNo" text,
    "nextFollowupDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "enquiryTypeId" text,
    "memberSize" integer
);


--
-- Name: gyminquiryfollowup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gyminquiryfollowup (
    id text NOT NULL,
    "gymInquiryId" text NOT NULL,
    "followupDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: gymsubscriptionhistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gymsubscriptionhistory (
    id text NOT NULL,
    "subscriptionNumber" text NOT NULL,
    "gymId" text NOT NULL,
    "subscriptionPlanId" text NOT NULL,
    "subscriptionStart" timestamp(3) without time zone NOT NULL,
    "subscriptionEnd" timestamp(3) without time zone NOT NULL,
    "renewalDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "previousPlanId" text,
    "previousPlanName" text,
    "previousSubscriptionEnd" timestamp(3) without time zone,
    "renewalType" public."GymSubscriptionRenewalType" DEFAULT 'NEW'::public."GymSubscriptionRenewalType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentMode" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PAID'::public."PaymentStatus" NOT NULL,
    "paidAmount" numeric(10,2),
    "pendingAmount" numeric(10,2),
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "extraDiscount" numeric(10,2),
    "planAmount" numeric(10,2)
);


--
-- Name: member_biometric; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_biometric (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "gymId" text NOT NULL,
    "fingerTemplate1" bytea,
    "fingerTemplate2" bytea,
    "fingerPosition1" public."FingerPosition",
    "fingerPosition2" public."FingerPosition",
    "templateFormat" text DEFAULT 'ISO_19794_2'::text NOT NULL,
    "templateVersion" text DEFAULT '1.0'::text NOT NULL,
    quality1 integer,
    quality2 integer,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "enrolledBy" text,
    "lastUpdatedAt" timestamp(3) without time zone NOT NULL,
    "deviceId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "failedAttempts" integer DEFAULT 0 NOT NULL,
    "lastFailedAt" timestamp(3) without time zone
);


--
-- Name: memberbalancepayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberbalancepayment (
    id text NOT NULL,
    "receiptNo" text NOT NULL,
    "memberId" text NOT NULL,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "contactNo" text,
    "paidFees" numeric(10,2) NOT NULL,
    "payMode" text NOT NULL,
    "nextPaymentDate" timestamp(3) without time zone,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "paymentFor" public."PaymentFor" DEFAULT 'REGULAR'::public."PaymentFor" NOT NULL
);


--
-- Name: memberdiet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberdiet (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "dietTemplateId" text NOT NULL,
    "gymId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "assignedBy" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: memberdietmeal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberdietmeal (
    id text NOT NULL,
    "memberDietId" text NOT NULL,
    "mealNo" integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "time" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: memberinquiry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberinquiry (
    id text NOT NULL,
    "fullName" text NOT NULL,
    "contactNo" text NOT NULL,
    "inquiryDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dob timestamp(3) without time zone,
    "followUp" boolean DEFAULT false NOT NULL,
    "followUpDate" timestamp(3) without time zone,
    gender text,
    address text,
    "heardAbout" text,
    "userId" text NOT NULL,
    comments text,
    "memberPhoto" text,
    height numeric(5,2),
    weight numeric(5,2),
    "referenceName" text,
    "gymId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


--
-- Name: membershiprenewal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membershiprenewal (
    id text NOT NULL,
    "renewalNumber" text NOT NULL,
    "memberId" text NOT NULL,
    "gymId" text NOT NULL,
    "previousMembershipStart" timestamp(3) without time zone NOT NULL,
    "previousMembershipEnd" timestamp(3) without time zone NOT NULL,
    "newMembershipStart" timestamp(3) without time zone NOT NULL,
    "newMembershipEnd" timestamp(3) without time zone NOT NULL,
    "renewalDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "renewalType" public."RenewalType" DEFAULT 'STANDARD'::public."RenewalType" NOT NULL,
    "coursePackageId" text,
    "packageFees" numeric(10,2),
    "maxDiscount" numeric(10,2),
    "afterDiscount" numeric(10,2),
    "extraDiscount" numeric(10,2),
    "finalFees" numeric(10,2),
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMode" text,
    "paidAmount" numeric(10,2),
    "pendingAmount" numeric(10,2),
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


--
-- Name: occupationmaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occupationmaster (
    id text NOT NULL,
    "occupationName" text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- Name: passwordresethistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.passwordresethistory (
    id text NOT NULL,
    "userId" text NOT NULL,
    "roleId" text,
    "roleName" text,
    "resetBy" text,
    "resetMethod" text DEFAULT 'MANUAL'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text,
    "resetByEmail" text,
    "targetTable" text,
    "gymId" text,
    "ipAddress" text
);


--
-- Name: paymenttypemaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paymenttypemaster (
    id text NOT NULL,
    "paymentTypeName" text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- Name: plancategorymaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plancategorymaster (
    id text NOT NULL,
    "categoryName" text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- Name: ptsessioncredit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ptsessioncredit (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "sessionCredits" integer NOT NULL,
    "originalPackage" text NOT NULL,
    "creditDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "usedCredits" integer DEFAULT 0 NOT NULL,
    reason text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


--
-- Name: trainersalarysettlement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainersalarysettlement (
    id text NOT NULL,
    "trainerId" text NOT NULL,
    "trainerName" text NOT NULL,
    "mobileNumber" text,
    "joiningDate" timestamp(3) without time zone,
    "monthlySalary" numeric(10,2) NOT NULL,
    "salaryMonth" text NOT NULL,
    "salarySentDate" timestamp(3) without time zone,
    "totalDaysInMonth" integer NOT NULL,
    "presentDays" integer NOT NULL,
    "absentDays" integer NOT NULL,
    "discountDays" integer DEFAULT 0 NOT NULL,
    "payableDays" integer NOT NULL,
    "calculatedSalary" numeric(10,2) NOT NULL,
    "incentiveAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "incentiveType" public."IncentiveType",
    "paymentMode" public."PaymentMode" NOT NULL,
    "finalPayableAmount" numeric(10,2) NOT NULL,
    remarks text,
    "gymId" text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: workoutexercisemaster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workoutexercisemaster (
    id text NOT NULL,
    "exerciseName" text NOT NULL,
    "shortCode" character varying(20),
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "gymId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bodyPartId" text
);


--
-- Name: DietPlan DietPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DietPlan"
    ADD CONSTRAINT "DietPlan_pkey" PRIMARY KEY (id);


--
-- Name: ExercisePlan ExercisePlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExercisePlan"
    ADD CONSTRAINT "ExercisePlan_pkey" PRIMARY KEY (id);


--
-- Name: GymSubscriptionPlan GymSubscriptionPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GymSubscriptionPlan"
    ADD CONSTRAINT "GymSubscriptionPlan_pkey" PRIMARY KEY (id);


--
-- Name: Gym Gym_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gym"
    ADD CONSTRAINT "Gym_pkey" PRIMARY KEY (id);


--
-- Name: Inquiry Inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_pkey" PRIMARY KEY (id);


--
-- Name: MemberDietAssignment MemberDietAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberDietAssignment"
    ADD CONSTRAINT "MemberDietAssignment_pkey" PRIMARY KEY (id);


--
-- Name: MemberDietPlan MemberDietPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberDietPlan"
    ADD CONSTRAINT "MemberDietPlan_pkey" PRIMARY KEY (id);


--
-- Name: MemberExerciseAssignment MemberExerciseAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberExerciseAssignment"
    ADD CONSTRAINT "MemberExerciseAssignment_pkey" PRIMARY KEY (id);


--
-- Name: MemberTrainerAssignment MemberTrainerAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberTrainerAssignment"
    ADD CONSTRAINT "MemberTrainerAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Member Member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY (id);


--
-- Name: PTMember PTMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PTMember"
    ADD CONSTRAINT "PTMember_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Rolemaster Rolemaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Rolemaster"
    ADD CONSTRAINT "Rolemaster_pkey" PRIMARY KEY ("Id");


--
-- Name: Supplement Supplement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplement"
    ADD CONSTRAINT "Supplement_pkey" PRIMARY KEY (id);


--
-- Name: Trainer Trainer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Trainer"
    ADD CONSTRAINT "Trainer_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_expense_group_master admin_expense_group_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_expense_group_master
    ADD CONSTRAINT admin_expense_group_master_pkey PRIMARY KEY (id);


--
-- Name: admin_expense_master admin_expense_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_expense_master
    ADD CONSTRAINT admin_expense_master_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: biometric_device biometric_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_device
    ADD CONSTRAINT biometric_device_pkey PRIMARY KEY (id);


--
-- Name: bodypartmaster bodypartmaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bodypartmaster
    ADD CONSTRAINT bodypartmaster_pkey PRIMARY KEY (id);


--
-- Name: coursepackage coursepackage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coursepackage
    ADD CONSTRAINT coursepackage_pkey PRIMARY KEY (id);


--
-- Name: designationmaster designationmaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designationmaster
    ADD CONSTRAINT designationmaster_pkey PRIMARY KEY (id);


--
-- Name: dietmeal dietmeal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dietmeal
    ADD CONSTRAINT dietmeal_pkey PRIMARY KEY (id);


--
-- Name: diettemplate diettemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diettemplate
    ADD CONSTRAINT diettemplate_pkey PRIMARY KEY (id);


--
-- Name: enquirytypemaster enquirytypemaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquirytypemaster
    ADD CONSTRAINT enquirytypemaster_pkey PRIMARY KEY (id);


--
-- Name: expensegroupmaster expensegroupmaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expensegroupmaster
    ADD CONSTRAINT expensegroupmaster_pkey PRIMARY KEY (id);


--
-- Name: expensemaster expensemaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expensemaster
    ADD CONSTRAINT expensemaster_pkey PRIMARY KEY (id);


--
-- Name: gyminquiry gyminquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gyminquiry
    ADD CONSTRAINT gyminquiry_pkey PRIMARY KEY (id);


--
-- Name: gyminquiryfollowup gyminquiryfollowup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gyminquiryfollowup
    ADD CONSTRAINT gyminquiryfollowup_pkey PRIMARY KEY (id);


--
-- Name: gymsubscriptionhistory gymsubscriptionhistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gymsubscriptionhistory
    ADD CONSTRAINT gymsubscriptionhistory_pkey PRIMARY KEY (id);


--
-- Name: member_biometric member_biometric_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_biometric
    ADD CONSTRAINT member_biometric_pkey PRIMARY KEY (id);


--
-- Name: memberbalancepayment memberbalancepayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberbalancepayment
    ADD CONSTRAINT memberbalancepayment_pkey PRIMARY KEY (id);


--
-- Name: memberdiet memberdiet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdiet
    ADD CONSTRAINT memberdiet_pkey PRIMARY KEY (id);


--
-- Name: memberdietmeal memberdietmeal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdietmeal
    ADD CONSTRAINT memberdietmeal_pkey PRIMARY KEY (id);


--
-- Name: memberinquiry memberinquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberinquiry
    ADD CONSTRAINT memberinquiry_pkey PRIMARY KEY (id);


--
-- Name: membershiprenewal membershiprenewal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membershiprenewal
    ADD CONSTRAINT membershiprenewal_pkey PRIMARY KEY (id);


--
-- Name: occupationmaster occupationmaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupationmaster
    ADD CONSTRAINT occupationmaster_pkey PRIMARY KEY (id);


--
-- Name: passwordresethistory passwordresethistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.passwordresethistory
    ADD CONSTRAINT passwordresethistory_pkey PRIMARY KEY (id);


--
-- Name: paymenttypemaster paymenttypemaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paymenttypemaster
    ADD CONSTRAINT paymenttypemaster_pkey PRIMARY KEY (id);


--
-- Name: plancategorymaster plancategorymaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plancategorymaster
    ADD CONSTRAINT plancategorymaster_pkey PRIMARY KEY (id);


--
-- Name: ptsessioncredit ptsessioncredit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ptsessioncredit
    ADD CONSTRAINT ptsessioncredit_pkey PRIMARY KEY (id);


--
-- Name: trainersalarysettlement trainersalarysettlement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainersalarysettlement
    ADD CONSTRAINT trainersalarysettlement_pkey PRIMARY KEY (id);


--
-- Name: workoutexercisemaster workoutexercisemaster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workoutexercisemaster
    ADD CONSTRAINT workoutexercisemaster_pkey PRIMARY KEY (id);


--
-- Name: DietPlan_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DietPlan_gymId_idx" ON public."DietPlan" USING btree ("gymId");


--
-- Name: ExercisePlan_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExercisePlan_gymId_idx" ON public."ExercisePlan" USING btree ("gymId");


--
-- Name: GymSubscriptionPlan_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GymSubscriptionPlan_isActive_idx" ON public."GymSubscriptionPlan" USING btree ("isActive");


--
-- Name: GymSubscriptionPlan_priceCurrency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GymSubscriptionPlan_priceCurrency_idx" ON public."GymSubscriptionPlan" USING btree ("priceCurrency");


--
-- Name: Gym_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Gym_city_idx" ON public."Gym" USING btree (city);


--
-- Name: Gym_gstRegNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Gym_gstRegNo_idx" ON public."Gym" USING btree ("gstRegNo");


--
-- Name: Gym_ownerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Gym_ownerId_idx" ON public."Gym" USING btree ("ownerId");


--
-- Name: Gym_ownerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Gym_ownerId_key" ON public."Gym" USING btree ("ownerId");


--
-- Name: Gym_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Gym_state_idx" ON public."Gym" USING btree (state);


--
-- Name: Gym_zipcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Gym_zipcode_idx" ON public."Gym" USING btree (zipcode);


--
-- Name: Inquiry_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inquiry_gymId_idx" ON public."Inquiry" USING btree ("gymId");


--
-- Name: Inquiry_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inquiry_status_idx" ON public."Inquiry" USING btree (status);


--
-- Name: MemberDietAssignment_dietPlanId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberDietAssignment_dietPlanId_idx" ON public."MemberDietAssignment" USING btree ("dietPlanId");


--
-- Name: MemberDietAssignment_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberDietAssignment_memberId_idx" ON public."MemberDietAssignment" USING btree ("memberId");


--
-- Name: MemberDietPlan_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberDietPlan_gymId_idx" ON public."MemberDietPlan" USING btree ("gymId");


--
-- Name: MemberDietPlan_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberDietPlan_memberId_idx" ON public."MemberDietPlan" USING btree ("memberId");


--
-- Name: MemberExerciseAssignment_exercisePlanId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberExerciseAssignment_exercisePlanId_idx" ON public."MemberExerciseAssignment" USING btree ("exercisePlanId");


--
-- Name: MemberExerciseAssignment_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberExerciseAssignment_memberId_idx" ON public."MemberExerciseAssignment" USING btree ("memberId");


--
-- Name: MemberTrainerAssignment_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberTrainerAssignment_memberId_idx" ON public."MemberTrainerAssignment" USING btree ("memberId");


--
-- Name: MemberTrainerAssignment_memberId_trainerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MemberTrainerAssignment_memberId_trainerId_key" ON public."MemberTrainerAssignment" USING btree ("memberId", "trainerId");


--
-- Name: MemberTrainerAssignment_trainerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MemberTrainerAssignment_trainerId_idx" ON public."MemberTrainerAssignment" USING btree ("trainerId");


--
-- Name: Member_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_email_idx" ON public."Member" USING btree (email);


--
-- Name: Member_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Member_email_key" ON public."Member" USING btree (email);


--
-- Name: Member_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_gymId_idx" ON public."Member" USING btree ("gymId");


--
-- Name: Member_hasPTAddon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_hasPTAddon_idx" ON public."Member" USING btree ("hasPTAddon");


--
-- Name: Member_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_isActive_idx" ON public."Member" USING btree ("isActive");


--
-- Name: Member_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_memberId_idx" ON public."Member" USING btree ("memberId");


--
-- Name: Member_memberType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_memberType_idx" ON public."Member" USING btree ("memberType");


--
-- Name: Member_membershipStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Member_membershipStatus_idx" ON public."Member" USING btree ("membershipStatus");


--
-- Name: Member_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Member_userId_key" ON public."Member" USING btree ("userId");


--
-- Name: PTMember_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PTMember_gymId_idx" ON public."PTMember" USING btree ("gymId");


--
-- Name: PTMember_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PTMember_memberId_idx" ON public."PTMember" USING btree ("memberId");


--
-- Name: PTMember_memberId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PTMember_memberId_key" ON public."PTMember" USING btree ("memberId");


--
-- Name: PTMember_trainerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PTMember_trainerId_idx" ON public."PTMember" USING btree ("trainerId");


--
-- Name: RefreshToken_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefreshToken_token_idx" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: Supplement_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Supplement_gymId_idx" ON public."Supplement" USING btree ("gymId");


--
-- Name: Supplement_ptMemberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Supplement_ptMemberId_idx" ON public."Supplement" USING btree ("ptMemberId");


--
-- Name: Trainer_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Trainer_email_idx" ON public."Trainer" USING btree (email);


--
-- Name: Trainer_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Trainer_email_key" ON public."Trainer" USING btree (email);


--
-- Name: Trainer_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Trainer_gymId_idx" ON public."Trainer" USING btree ("gymId");


--
-- Name: Trainer_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Trainer_isActive_idx" ON public."Trainer" USING btree ("isActive");


--
-- Name: Trainer_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Trainer_userId_key" ON public."Trainer" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_roleId_idx" ON public."User" USING btree ("roleId");


--
-- Name: admin_expense_group_master_expenseGroupName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admin_expense_group_master_expenseGroupName_idx" ON public.admin_expense_group_master USING btree ("expenseGroupName");


--
-- Name: admin_expense_group_master_expenseGroupName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "admin_expense_group_master_expenseGroupName_key" ON public.admin_expense_group_master USING btree ("expenseGroupName");


--
-- Name: admin_expense_master_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admin_expense_master_createdBy_idx" ON public.admin_expense_master USING btree ("createdBy");


--
-- Name: admin_expense_master_expenseDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admin_expense_master_expenseDate_idx" ON public.admin_expense_master USING btree ("expenseDate");


--
-- Name: admin_expense_master_expenseGroupId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admin_expense_master_expenseGroupId_idx" ON public.admin_expense_master USING btree ("expenseGroupId");


--
-- Name: admin_expense_master_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "admin_expense_master_isActive_idx" ON public.admin_expense_master USING btree ("isActive");


--
-- Name: attendance_attendanceDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "attendance_attendanceDate_idx" ON public.attendance USING btree ("attendanceDate");


--
-- Name: attendance_gymId_attendanceDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "attendance_gymId_attendanceDate_idx" ON public.attendance USING btree ("gymId", "attendanceDate");


--
-- Name: attendance_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "attendance_gymId_idx" ON public.attendance USING btree ("gymId");


--
-- Name: attendance_memberId_attendanceDate_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "attendance_memberId_attendanceDate_key" ON public.attendance USING btree ("memberId", "attendanceDate");


--
-- Name: attendance_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "attendance_memberId_idx" ON public.attendance USING btree ("memberId");


--
-- Name: attendance_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendance_status_idx ON public.attendance USING btree (status);


--
-- Name: biometric_device_deviceSerial_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "biometric_device_deviceSerial_key" ON public.biometric_device USING btree ("deviceSerial");


--
-- Name: biometric_device_deviceType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "biometric_device_deviceType_idx" ON public.biometric_device USING btree ("deviceType");


--
-- Name: biometric_device_gymId_deviceName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "biometric_device_gymId_deviceName_key" ON public.biometric_device USING btree ("gymId", "deviceName");


--
-- Name: biometric_device_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "biometric_device_gymId_idx" ON public.biometric_device USING btree ("gymId");


--
-- Name: biometric_device_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "biometric_device_isActive_idx" ON public.biometric_device USING btree ("isActive");


--
-- Name: bodypartmaster_bodyPartName_gymId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "bodypartmaster_bodyPartName_gymId_key" ON public.bodypartmaster USING btree ("bodyPartName", "gymId");


--
-- Name: bodypartmaster_bodyPartName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bodypartmaster_bodyPartName_idx" ON public.bodypartmaster USING btree ("bodyPartName");


--
-- Name: bodypartmaster_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bodypartmaster_gymId_idx" ON public.bodypartmaster USING btree ("gymId");


--
-- Name: bodypartmaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bodypartmaster_isActive_idx" ON public.bodypartmaster USING btree ("isActive");


--
-- Name: coursepackage_coursePackageType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coursepackage_coursePackageType_idx" ON public.coursepackage USING btree ("coursePackageType");


--
-- Name: coursepackage_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coursepackage_gymId_idx" ON public.coursepackage USING btree ("gymId");


--
-- Name: coursepackage_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coursepackage_isActive_idx" ON public.coursepackage USING btree ("isActive");


--
-- Name: coursepackage_packageName_gymId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "coursepackage_packageName_gymId_key" ON public.coursepackage USING btree ("packageName", "gymId");


--
-- Name: coursepackage_packageName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "coursepackage_packageName_idx" ON public.coursepackage USING btree ("packageName");


--
-- Name: designationmaster_designationName_gymId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "designationmaster_designationName_gymId_key" ON public.designationmaster USING btree ("designationName", "gymId");


--
-- Name: designationmaster_designationName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "designationmaster_designationName_idx" ON public.designationmaster USING btree ("designationName");


--
-- Name: designationmaster_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "designationmaster_gymId_idx" ON public.designationmaster USING btree ("gymId");


--
-- Name: dietmeal_dietTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dietmeal_dietTemplateId_idx" ON public.dietmeal USING btree ("dietTemplateId");


--
-- Name: dietmeal_dietTemplateId_mealNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "dietmeal_dietTemplateId_mealNo_key" ON public.dietmeal USING btree ("dietTemplateId", "mealNo");


--
-- Name: diettemplate_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "diettemplate_createdBy_idx" ON public.diettemplate USING btree ("createdBy");


--
-- Name: diettemplate_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "diettemplate_gymId_idx" ON public.diettemplate USING btree ("gymId");


--
-- Name: diettemplate_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "diettemplate_isActive_idx" ON public.diettemplate USING btree ("isActive");


--
-- Name: enquirytypemaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "enquirytypemaster_isActive_idx" ON public.enquirytypemaster USING btree ("isActive");


--
-- Name: enquirytypemaster_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enquirytypemaster_name_idx ON public.enquirytypemaster USING btree (name);


--
-- Name: enquirytypemaster_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX enquirytypemaster_name_key ON public.enquirytypemaster USING btree (name);


--
-- Name: expensegroupmaster_expenseGroupName_gymId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "expensegroupmaster_expenseGroupName_gymId_key" ON public.expensegroupmaster USING btree ("expenseGroupName", "gymId");


--
-- Name: expensegroupmaster_expenseGroupName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensegroupmaster_expenseGroupName_idx" ON public.expensegroupmaster USING btree ("expenseGroupName");


--
-- Name: expensegroupmaster_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensegroupmaster_gymId_idx" ON public.expensegroupmaster USING btree ("gymId");


--
-- Name: expensemaster_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensemaster_createdBy_idx" ON public.expensemaster USING btree ("createdBy");


--
-- Name: expensemaster_expenseDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensemaster_expenseDate_idx" ON public.expensemaster USING btree ("expenseDate");


--
-- Name: expensemaster_expenseGroupId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensemaster_expenseGroupId_idx" ON public.expensemaster USING btree ("expenseGroupId");


--
-- Name: expensemaster_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensemaster_gymId_idx" ON public.expensemaster USING btree ("gymId");


--
-- Name: expensemaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "expensemaster_isActive_idx" ON public.expensemaster USING btree ("isActive");


--
-- Name: gyminquiry_enquiryTypeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gyminquiry_enquiryTypeId_idx" ON public.gyminquiry USING btree ("enquiryTypeId");


--
-- Name: gyminquiry_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gyminquiry_isActive_idx" ON public.gyminquiry USING btree ("isActive");


--
-- Name: gyminquiry_nextFollowupDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gyminquiry_nextFollowupDate_idx" ON public.gyminquiry USING btree ("nextFollowupDate");


--
-- Name: gyminquiry_subscriptionPlanId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gyminquiry_subscriptionPlanId_idx" ON public.gyminquiry USING btree ("subscriptionPlanId");


--
-- Name: gyminquiryfollowup_followupDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gyminquiryfollowup_followupDate_idx" ON public.gyminquiryfollowup USING btree ("followupDate");


--
-- Name: gyminquiryfollowup_gymInquiryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gyminquiryfollowup_gymInquiryId_idx" ON public.gyminquiryfollowup USING btree ("gymInquiryId");


--
-- Name: gymsubscriptionhistory_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gymsubscriptionhistory_gymId_idx" ON public.gymsubscriptionhistory USING btree ("gymId");


--
-- Name: gymsubscriptionhistory_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gymsubscriptionhistory_isActive_idx" ON public.gymsubscriptionhistory USING btree ("isActive");


--
-- Name: gymsubscriptionhistory_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gymsubscriptionhistory_paymentStatus_idx" ON public.gymsubscriptionhistory USING btree ("paymentStatus");


--
-- Name: gymsubscriptionhistory_renewalDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gymsubscriptionhistory_renewalDate_idx" ON public.gymsubscriptionhistory USING btree ("renewalDate");


--
-- Name: gymsubscriptionhistory_subscriptionNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gymsubscriptionhistory_subscriptionNumber_idx" ON public.gymsubscriptionhistory USING btree ("subscriptionNumber");


--
-- Name: gymsubscriptionhistory_subscriptionPlanId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gymsubscriptionhistory_subscriptionPlanId_idx" ON public.gymsubscriptionhistory USING btree ("subscriptionPlanId");


--
-- Name: member_biometric_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "member_biometric_gymId_idx" ON public.member_biometric USING btree ("gymId");


--
-- Name: member_biometric_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "member_biometric_isActive_idx" ON public.member_biometric USING btree ("isActive");


--
-- Name: member_biometric_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "member_biometric_memberId_idx" ON public.member_biometric USING btree ("memberId");


--
-- Name: member_biometric_memberId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "member_biometric_memberId_key" ON public.member_biometric USING btree ("memberId");


--
-- Name: memberbalancepayment_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberbalancepayment_gymId_idx" ON public.memberbalancepayment USING btree ("gymId");


--
-- Name: memberbalancepayment_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberbalancepayment_memberId_idx" ON public.memberbalancepayment USING btree ("memberId");


--
-- Name: memberbalancepayment_paymentDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberbalancepayment_paymentDate_idx" ON public.memberbalancepayment USING btree ("paymentDate");


--
-- Name: memberbalancepayment_paymentFor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberbalancepayment_paymentFor_idx" ON public.memberbalancepayment USING btree ("paymentFor");


--
-- Name: memberbalancepayment_receiptNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberbalancepayment_receiptNo_idx" ON public.memberbalancepayment USING btree ("receiptNo");


--
-- Name: memberdiet_assignedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdiet_assignedBy_idx" ON public.memberdiet USING btree ("assignedBy");


--
-- Name: memberdiet_dietTemplateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdiet_dietTemplateId_idx" ON public.memberdiet USING btree ("dietTemplateId");


--
-- Name: memberdiet_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdiet_gymId_idx" ON public.memberdiet USING btree ("gymId");


--
-- Name: memberdiet_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdiet_isActive_idx" ON public.memberdiet USING btree ("isActive");


--
-- Name: memberdiet_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdiet_memberId_idx" ON public.memberdiet USING btree ("memberId");


--
-- Name: memberdiet_startDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdiet_startDate_idx" ON public.memberdiet USING btree ("startDate");


--
-- Name: memberdietmeal_memberDietId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberdietmeal_memberDietId_idx" ON public.memberdietmeal USING btree ("memberDietId");


--
-- Name: memberdietmeal_memberDietId_mealNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "memberdietmeal_memberDietId_mealNo_key" ON public.memberdietmeal USING btree ("memberDietId", "mealNo");


--
-- Name: memberinquiry_contactNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberinquiry_contactNo_idx" ON public.memberinquiry USING btree ("contactNo");


--
-- Name: memberinquiry_followUp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberinquiry_followUp_idx" ON public.memberinquiry USING btree ("followUp");


--
-- Name: memberinquiry_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberinquiry_gymId_idx" ON public.memberinquiry USING btree ("gymId");


--
-- Name: memberinquiry_inquiryDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberinquiry_inquiryDate_idx" ON public.memberinquiry USING btree ("inquiryDate");


--
-- Name: memberinquiry_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberinquiry_isActive_idx" ON public.memberinquiry USING btree ("isActive");


--
-- Name: memberinquiry_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "memberinquiry_userId_idx" ON public.memberinquiry USING btree ("userId");


--
-- Name: membershiprenewal_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membershiprenewal_gymId_idx" ON public.membershiprenewal USING btree ("gymId");


--
-- Name: membershiprenewal_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membershiprenewal_memberId_idx" ON public.membershiprenewal USING btree ("memberId");


--
-- Name: membershiprenewal_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membershiprenewal_paymentStatus_idx" ON public.membershiprenewal USING btree ("paymentStatus");


--
-- Name: membershiprenewal_renewalDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membershiprenewal_renewalDate_idx" ON public.membershiprenewal USING btree ("renewalDate");


--
-- Name: membershiprenewal_renewalNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "membershiprenewal_renewalNumber_idx" ON public.membershiprenewal USING btree ("renewalNumber");


--
-- Name: occupationmaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "occupationmaster_isActive_idx" ON public.occupationmaster USING btree ("isActive");


--
-- Name: occupationmaster_occupationName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "occupationmaster_occupationName_idx" ON public.occupationmaster USING btree ("occupationName");


--
-- Name: occupationmaster_occupationName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "occupationmaster_occupationName_key" ON public.occupationmaster USING btree ("occupationName");


--
-- Name: passwordresethistory_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "passwordresethistory_createdAt_idx" ON public.passwordresethistory USING btree ("createdAt");


--
-- Name: passwordresethistory_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX passwordresethistory_email_idx ON public.passwordresethistory USING btree (email);


--
-- Name: passwordresethistory_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "passwordresethistory_gymId_idx" ON public.passwordresethistory USING btree ("gymId");


--
-- Name: passwordresethistory_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "passwordresethistory_roleId_idx" ON public.passwordresethistory USING btree ("roleId");


--
-- Name: passwordresethistory_roleName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "passwordresethistory_roleName_idx" ON public.passwordresethistory USING btree ("roleName");


--
-- Name: passwordresethistory_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "passwordresethistory_userId_idx" ON public.passwordresethistory USING btree ("userId");


--
-- Name: paymenttypemaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "paymenttypemaster_isActive_idx" ON public.paymenttypemaster USING btree ("isActive");


--
-- Name: paymenttypemaster_paymentTypeName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "paymenttypemaster_paymentTypeName_idx" ON public.paymenttypemaster USING btree ("paymentTypeName");


--
-- Name: paymenttypemaster_paymentTypeName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "paymenttypemaster_paymentTypeName_key" ON public.paymenttypemaster USING btree ("paymentTypeName");


--
-- Name: plancategorymaster_categoryName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "plancategorymaster_categoryName_idx" ON public.plancategorymaster USING btree ("categoryName");


--
-- Name: plancategorymaster_categoryName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "plancategorymaster_categoryName_key" ON public.plancategorymaster USING btree ("categoryName");


--
-- Name: plancategorymaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "plancategorymaster_isActive_idx" ON public.plancategorymaster USING btree ("isActive");


--
-- Name: ptsessioncredit_expiryDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ptsessioncredit_expiryDate_idx" ON public.ptsessioncredit USING btree ("expiryDate");


--
-- Name: ptsessioncredit_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ptsessioncredit_gymId_idx" ON public.ptsessioncredit USING btree ("gymId");


--
-- Name: ptsessioncredit_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ptsessioncredit_isActive_idx" ON public.ptsessioncredit USING btree ("isActive");


--
-- Name: ptsessioncredit_memberId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ptsessioncredit_memberId_idx" ON public.ptsessioncredit USING btree ("memberId");


--
-- Name: trainersalarysettlement_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainersalarysettlement_createdAt_idx" ON public.trainersalarysettlement USING btree ("createdAt");


--
-- Name: trainersalarysettlement_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainersalarysettlement_gymId_idx" ON public.trainersalarysettlement USING btree ("gymId");


--
-- Name: trainersalarysettlement_paymentMode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainersalarysettlement_paymentMode_idx" ON public.trainersalarysettlement USING btree ("paymentMode");


--
-- Name: trainersalarysettlement_salaryMonth_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainersalarysettlement_salaryMonth_idx" ON public.trainersalarysettlement USING btree ("salaryMonth");


--
-- Name: trainersalarysettlement_trainerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainersalarysettlement_trainerId_idx" ON public.trainersalarysettlement USING btree ("trainerId");


--
-- Name: trainersalarysettlement_trainerId_salaryMonth_gymId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "trainersalarysettlement_trainerId_salaryMonth_gymId_key" ON public.trainersalarysettlement USING btree ("trainerId", "salaryMonth", "gymId");


--
-- Name: workoutexercisemaster_bodyPartId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "workoutexercisemaster_bodyPartId_idx" ON public.workoutexercisemaster USING btree ("bodyPartId");


--
-- Name: workoutexercisemaster_exerciseName_gymId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "workoutexercisemaster_exerciseName_gymId_key" ON public.workoutexercisemaster USING btree ("exerciseName", "gymId");


--
-- Name: workoutexercisemaster_exerciseName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "workoutexercisemaster_exerciseName_idx" ON public.workoutexercisemaster USING btree ("exerciseName");


--
-- Name: workoutexercisemaster_gymId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "workoutexercisemaster_gymId_idx" ON public.workoutexercisemaster USING btree ("gymId");


--
-- Name: workoutexercisemaster_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "workoutexercisemaster_isActive_idx" ON public.workoutexercisemaster USING btree ("isActive");


--
-- Name: workoutexercisemaster_shortCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "workoutexercisemaster_shortCode_idx" ON public.workoutexercisemaster USING btree ("shortCode");


--
-- Name: DietPlan DietPlan_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DietPlan"
    ADD CONSTRAINT "DietPlan_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExercisePlan ExercisePlan_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExercisePlan"
    ADD CONSTRAINT "ExercisePlan_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Gym Gym_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gym"
    ADD CONSTRAINT "Gym_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Gym Gym_subscriptionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gym"
    ADD CONSTRAINT "Gym_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES public."GymSubscriptionPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MemberDietAssignment MemberDietAssignment_dietPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberDietAssignment"
    ADD CONSTRAINT "MemberDietAssignment_dietPlanId_fkey" FOREIGN KEY ("dietPlanId") REFERENCES public."DietPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDietAssignment MemberDietAssignment_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberDietAssignment"
    ADD CONSTRAINT "MemberDietAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberDietPlan MemberDietPlan_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberDietPlan"
    ADD CONSTRAINT "MemberDietPlan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberExerciseAssignment MemberExerciseAssignment_exercisePlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberExerciseAssignment"
    ADD CONSTRAINT "MemberExerciseAssignment_exercisePlanId_fkey" FOREIGN KEY ("exercisePlanId") REFERENCES public."ExercisePlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberExerciseAssignment MemberExerciseAssignment_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberExerciseAssignment"
    ADD CONSTRAINT "MemberExerciseAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberTrainerAssignment MemberTrainerAssignment_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberTrainerAssignment"
    ADD CONSTRAINT "MemberTrainerAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberTrainerAssignment MemberTrainerAssignment_trainerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberTrainerAssignment"
    ADD CONSTRAINT "MemberTrainerAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES public."Trainer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Member Member_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Member Member_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PTMember PTMember_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PTMember"
    ADD CONSTRAINT "PTMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PTMember PTMember_trainerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PTMember"
    ADD CONSTRAINT "PTMember_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES public."Trainer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Supplement Supplement_ptMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplement"
    ADD CONSTRAINT "Supplement_ptMemberId_fkey" FOREIGN KEY ("ptMemberId") REFERENCES public."PTMember"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trainer Trainer_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Trainer"
    ADD CONSTRAINT "Trainer_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Trainer Trainer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Trainer"
    ADD CONSTRAINT "Trainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Rolemaster"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: admin_expense_master admin_expense_master_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_expense_master
    ADD CONSTRAINT "admin_expense_master_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_expense_master admin_expense_master_expenseGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_expense_master
    ADD CONSTRAINT "admin_expense_master_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES public.admin_expense_group_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendance attendance_deviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES public.biometric_device(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendance attendance_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: biometric_device biometric_device_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_device
    ADD CONSTRAINT "biometric_device_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bodypartmaster bodypartmaster_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bodypartmaster
    ADD CONSTRAINT "bodypartmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coursepackage coursepackage_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coursepackage
    ADD CONSTRAINT "coursepackage_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: designationmaster designationmaster_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designationmaster
    ADD CONSTRAINT "designationmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dietmeal dietmeal_dietTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dietmeal
    ADD CONSTRAINT "dietmeal_dietTemplateId_fkey" FOREIGN KEY ("dietTemplateId") REFERENCES public.diettemplate(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: diettemplate diettemplate_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diettemplate
    ADD CONSTRAINT "diettemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: diettemplate diettemplate_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diettemplate
    ADD CONSTRAINT "diettemplate_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expensegroupmaster expensegroupmaster_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expensegroupmaster
    ADD CONSTRAINT "expensegroupmaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expensemaster expensemaster_expenseGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expensemaster
    ADD CONSTRAINT "expensemaster_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES public.expensegroupmaster(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expensemaster expensemaster_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expensemaster
    ADD CONSTRAINT "expensemaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gyminquiry gyminquiry_enquiryTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gyminquiry
    ADD CONSTRAINT "gyminquiry_enquiryTypeId_fkey" FOREIGN KEY ("enquiryTypeId") REFERENCES public.enquirytypemaster(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gyminquiry gyminquiry_subscriptionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gyminquiry
    ADD CONSTRAINT "gyminquiry_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES public."GymSubscriptionPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gyminquiryfollowup gyminquiryfollowup_gymInquiryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gyminquiryfollowup
    ADD CONSTRAINT "gyminquiryfollowup_gymInquiryId_fkey" FOREIGN KEY ("gymInquiryId") REFERENCES public.gyminquiry(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gymsubscriptionhistory gymsubscriptionhistory_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gymsubscriptionhistory
    ADD CONSTRAINT "gymsubscriptionhistory_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gymsubscriptionhistory gymsubscriptionhistory_subscriptionPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gymsubscriptionhistory
    ADD CONSTRAINT "gymsubscriptionhistory_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES public."GymSubscriptionPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: member_biometric member_biometric_enrolledBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_biometric
    ADD CONSTRAINT "member_biometric_enrolledBy_fkey" FOREIGN KEY ("enrolledBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: member_biometric member_biometric_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_biometric
    ADD CONSTRAINT "member_biometric_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_biometric member_biometric_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_biometric
    ADD CONSTRAINT "member_biometric_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberbalancepayment memberbalancepayment_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberbalancepayment
    ADD CONSTRAINT "memberbalancepayment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberdiet memberdiet_assignedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdiet
    ADD CONSTRAINT "memberdiet_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: memberdiet memberdiet_dietTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdiet
    ADD CONSTRAINT "memberdiet_dietTemplateId_fkey" FOREIGN KEY ("dietTemplateId") REFERENCES public.diettemplate(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: memberdiet memberdiet_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdiet
    ADD CONSTRAINT "memberdiet_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberdiet memberdiet_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdiet
    ADD CONSTRAINT "memberdiet_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberdietmeal memberdietmeal_memberDietId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberdietmeal
    ADD CONSTRAINT "memberdietmeal_memberDietId_fkey" FOREIGN KEY ("memberDietId") REFERENCES public.memberdiet(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberinquiry memberinquiry_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberinquiry
    ADD CONSTRAINT "memberinquiry_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberinquiry memberinquiry_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberinquiry
    ADD CONSTRAINT "memberinquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: membershiprenewal membershiprenewal_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membershiprenewal
    ADD CONSTRAINT "membershiprenewal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: passwordresethistory passwordresethistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.passwordresethistory
    ADD CONSTRAINT "passwordresethistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ptsessioncredit ptsessioncredit_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ptsessioncredit
    ADD CONSTRAINT "ptsessioncredit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trainersalarysettlement trainersalarysettlement_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainersalarysettlement
    ADD CONSTRAINT "trainersalarysettlement_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trainersalarysettlement trainersalarysettlement_trainerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainersalarysettlement
    ADD CONSTRAINT "trainersalarysettlement_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES public."Trainer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workoutexercisemaster workoutexercisemaster_bodyPartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workoutexercisemaster
    ADD CONSTRAINT "workoutexercisemaster_bodyPartId_fkey" FOREIGN KEY ("bodyPartId") REFERENCES public.bodypartmaster(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workoutexercisemaster workoutexercisemaster_gymId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workoutexercisemaster
    ADD CONSTRAINT "workoutexercisemaster_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES public."Gym"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict asgc27FGvW3EwKOn7ir83ch8O7sMehbWiKFbZAd5OfgMXUoUTG3Co2inf6CIDlc

