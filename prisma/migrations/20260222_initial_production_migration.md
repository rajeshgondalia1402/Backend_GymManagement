# Initial Migration for Production Start - February 22, 2026

This migration script cleans up the database for production deployment while preserving essential master data.

## Tables Preserved (NOT truncated):
| Category | Table Name | Reason |
|----------|------------|--------|
| Admin | `GymSubscriptionPlan` | Admin subscription plans |
| Admin | `admin_expense_group_master` | Admin expense groups |
| Admin | `admin_expense_master` | Admin expenses |
| Admin | `enquirytypemaster` | Enquiry types master |
| Gym Owner | `expensegroupmaster` | Gym owner expense groups |
| Gym Owner | `designationmaster` | Gym owner designations |
| System | `Rolemaster` | Role definitions |
| System | `User` | Only admin@gymmanager.com preserved |

## Tables Truncated:
All other tables including: Gym, Member, Trainer, RefreshToken, PTMember, Inquiries, etc.

---

## SQL Migration Script

```sql
-- =============================================================================
-- INITIAL MIGRATION FOR PRODUCTION START
-- Date: February 22, 2026
-- Purpose: Clean database for production while preserving essential master data
-- =============================================================================

-- Start transaction for safety
BEGIN;

-- =============================================================================
-- STEP 1: Disable triggers temporarily (for faster truncation)
-- =============================================================================
SET session_replication_role = 'replica';

-- =============================================================================
-- STEP 2: TRUNCATE child tables first (tables with foreign keys)
-- Order matters due to foreign key constraints!
-- Using actual PostgreSQL table names (mapped names from Prisma schema)
-- =============================================================================

-- Level 6: Deepest child tables
TRUNCATE TABLE "memberdietmeal" CASCADE;
TRUNCATE TABLE "dietmeal" CASCADE;
TRUNCATE TABLE "gyminquiryfollowup" CASCADE;
TRUNCATE TABLE "passwordresethistory" CASCADE;

-- Level 5: Member-related child tables
TRUNCATE TABLE "memberbalancepayment" CASCADE;
TRUNCATE TABLE "MemberDietPlan" CASCADE;
TRUNCATE TABLE "MemberDietAssignment" CASCADE;
TRUNCATE TABLE "MemberExerciseAssignment" CASCADE;
TRUNCATE TABLE "MemberTrainerAssignment" CASCADE;
TRUNCATE TABLE "membershiprenewal" CASCADE;
TRUNCATE TABLE "ptsessioncredit" CASCADE;
TRUNCATE TABLE "memberdiet" CASCADE;

-- Level 4: PT and supplement tables
TRUNCATE TABLE "Supplement" CASCADE;
TRUNCATE TABLE "PTMember" CASCADE;

-- Level 3: Gym-related child tables
TRUNCATE TABLE "DietPlan" CASCADE;
TRUNCATE TABLE "ExercisePlan" CASCADE;
TRUNCATE TABLE "diettemplate" CASCADE;
TRUNCATE TABLE "bodypartmaster" CASCADE;
TRUNCATE TABLE "workoutexercisemaster" CASCADE;
TRUNCATE TABLE "coursepackage" CASCADE;
TRUNCATE TABLE "expensemaster" CASCADE;
TRUNCATE TABLE "memberinquiry" CASCADE;
TRUNCATE TABLE "trainersalarysettlement" CASCADE;
TRUNCATE TABLE "gymsubscriptionhistory" CASCADE;

-- Level 2: Primary entity tables
TRUNCATE TABLE "Member" CASCADE;
TRUNCATE TABLE "Trainer" CASCADE;
TRUNCATE TABLE "Inquiry" CASCADE;
TRUNCATE TABLE "gyminquiry" CASCADE;

-- Level 1: Core tables
TRUNCATE TABLE "Gym" CASCADE;
TRUNCATE TABLE "RefreshToken" CASCADE;

-- Truncate other master tables (not in preserved list)
TRUNCATE TABLE "occupationmaster" CASCADE;
TRUNCATE TABLE "paymenttypemaster" CASCADE;
TRUNCATE TABLE "plancategorymaster" CASCADE;

-- =============================================================================
-- STEP 3: Clean User table - Keep only admin@gymmanager.com
-- =============================================================================

-- Delete all users EXCEPT admin@gymmanager.com
DELETE FROM "User"
WHERE email != 'admin@gymmanager.com';

-- =============================================================================
-- STEP 4: Re-enable triggers
-- =============================================================================
SET session_replication_role = 'origin';

-- =============================================================================
-- STEP 5: Reset sequences for auto-generated IDs (if any)
-- =============================================================================
-- Note: UUIDs don't need sequence resets, but if you have any serial columns:
-- ALTER SEQUENCE IF EXISTS sequence_name RESTART WITH 1;

-- =============================================================================
-- STEP 6: Verify the preserved data
-- =============================================================================

-- Verify User table (should have only admin@gymmanager.com)
DO $$
DECLARE
    user_count INTEGER;
    admin_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "User";
    SELECT EXISTS(SELECT 1 FROM "User" WHERE email = 'admin@gymmanager.com') INTO admin_exists;

    IF NOT admin_exists THEN
        RAISE EXCEPTION 'Admin user (admin@gymmanager.com) not found! Migration failed.';
    END IF;

    RAISE NOTICE 'User table verification: % user(s) remaining, admin exists: %', user_count, admin_exists;
END $$;

-- Verify Rolemaster table is intact
DO $$
DECLARE
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM "Rolemaster";
    RAISE NOTICE 'Rolemaster table: % role(s) preserved', role_count;
END $$;

-- Verify GymSubscriptionPlan table is intact
DO $$
DECLARE
    plan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM "GymSubscriptionPlan";
    RAISE NOTICE 'GymSubscriptionPlan table: % plan(s) preserved', plan_count;
END $$;

-- Verify EnquiryTypeMaster table is intact
DO $$
DECLARE
    enquiry_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enquiry_count FROM "enquirytypemaster";
    RAISE NOTICE 'EnquiryTypeMaster table: % type(s) preserved', enquiry_count;
END $$;

-- Verify AdminExpenseGroupMaster table is intact
DO $$
DECLARE
    exp_group_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO exp_group_count FROM "admin_expense_group_master";
    RAISE NOTICE 'AdminExpenseGroupMaster table: % group(s) preserved', exp_group_count;
END $$;

-- Verify AdminExpenseMaster table is intact
DO $$
DECLARE
    expense_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO expense_count FROM "admin_expense_master";
    RAISE NOTICE 'AdminExpenseMaster table: % expense(s) preserved', expense_count;
END $$;

-- =============================================================================
-- COMMIT the transaction
-- =============================================================================
COMMIT;

-- =============================================================================
-- Summary of changes:
-- =============================================================================
-- PRESERVED TABLES (data kept):
--   1. GymSubscriptionPlan - Admin subscription plans
--   2. admin_expense_group_master - Admin expense groups
--   3. admin_expense_master - Admin expenses
--   4. enquirytypemaster - Enquiry types
--   5. expensegroupmaster - Gym owner expense groups (structure preserved)
--   6. designationmaster - Gym owner designations (structure preserved)
--   7. Rolemaster - All roles preserved
--   8. User - Only admin@gymmanager.com preserved
--
-- TRUNCATED TABLES (data removed):
--   - Gym, Member, Trainer, RefreshToken
--   - PTMember, Supplement, ptsessioncredit
--   - MemberDietPlan, memberbalancepayment, membershiprenewal
--   - DietPlan, ExercisePlan, diettemplate, dietmeal
--   - memberdiet, memberdietmeal
--   - MemberTrainerAssignment, MemberDietAssignment, MemberExerciseAssignment
--   - Inquiry, memberinquiry, gyminquiry, gyminquiryfollowup
--   - bodypartmaster, workoutexercisemaster, coursepackage
--   - expensemaster (gym owner expenses)
--   - trainersalarysettlement, gymsubscriptionhistory
--   - occupationmaster, paymenttypemaster, plancategorymaster
--   - passwordresethistory
--
-- NOTE: expensegroupmaster and designationmaster are preserved structurally
--       but will be empty since they have gymId FK (gym data is truncated)
-- =============================================================================
```

## How to Execute

### Option 1: Using psql command line
```bash
psql -U your_username -d your_database -f 20260222_initial_production_migration.sql
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Connect to your production database
3. Open Query Tool
4. Copy the SQL script above (content between ```sql and ```)
5. Execute the script

### Option 3: Using DBeaver or similar tools
1. Connect to PostgreSQL database
2. Open SQL Editor
3. Paste and execute the script

## Important Notes

1. **Backup First**: Always create a full database backup before running this migration
2. **Test Environment**: Run this on a test/staging environment first
3. **Foreign Keys**: The CASCADE option handles foreign key constraints automatically
4. **ExpenseGroupMaster & DesignationMaster**: These tables have `gymId` foreign key, so their data will be automatically removed when Gym table is truncated. They are preserved structurally but will be empty.
5. **Admin Expenses**: Admin expense tables (`admin_expense_master`, `admin_expense_group_master`) are fully preserved with all data since they don't depend on Gym.

## Rollback Plan

If you need to rollback, restore from the backup taken before migration:
```bash
pg_restore -U your_username -d your_database backup_file.dump
```
