\pset format unaligned
\pset tuples_only on
\pset fieldsep '|||'

\echo ---GYMSUBSCRIPTIONPLAN---
SELECT id, name, price, "durationDays", "isActive", "priceCurrency" FROM "GymSubscriptionPlan" ORDER BY name;

\echo ---USER_ADMIN---
SELECT "id", "email", "password", "name", "isActive", "roleId" FROM "User" WHERE "email" = 'admin@gymmanager.com';

\echo ---ROLEMASTER---
SELECT "Id", "rolename" FROM "Rolemaster" ORDER BY "rolename";

\echo ---ENQUIRYTYPEMASTER---
SELECT "id", "name", "isActive" FROM "enquirytypemaster" ORDER BY "name";

\echo ---ADMIN_EXPENSE_GROUP---
SELECT "id", "expenseGroupName" FROM "admin_expense_group_master" ORDER BY "expenseGroupName";
