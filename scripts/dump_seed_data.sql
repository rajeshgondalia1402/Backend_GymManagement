\pset format unaligned
\pset tuples_only on
\pset fieldsep '|'

-- Rolemaster
\echo ---ROLEMASTER---
SELECT "Id", "rolename" FROM "Rolemaster" ORDER BY "rolename";

-- User (admin only)
\echo ---USER_ADMIN---
SELECT "id", "email", "password", "name", "isActive", "roleId" FROM "User" WHERE "email" = 'admin@gymmanager.com';

-- GymSubscriptionPlan
\echo ---GYMSUBSCRIPTIONPLAN---
SELECT "id", "name", "description", "price", "durationDays", "features", "isActive", "priceCurrency" FROM "GymSubscriptionPlan" ORDER BY "name";

-- EnquiryTypeMaster
\echo ---ENQUIRYTYPEMASTER---
SELECT "id", "name", "isActive", "createdBy" FROM "enquirytypemaster" ORDER BY "name";

-- AdminExpenseGroupMaster
\echo ---ADMIN_EXPENSE_GROUP---
SELECT "id", "expenseGroupName" FROM "admin_expense_group_master" ORDER BY "expenseGroupName";

-- Check all enums
\echo ---ENUMS---
SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder;

-- Check all indexes
\echo ---INDEXES---
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename != '_prisma_migrations' ORDER BY tablename, indexname;

-- Check all foreign keys
\echo ---FOREIGN_KEYS---
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check all unique constraints
\echo ---UNIQUE_CONSTRAINTS---
SELECT tc.table_name, kcu.column_name, tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
