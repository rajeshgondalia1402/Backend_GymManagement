\pset format unaligned
\pset tuples_only on

\echo ---ROLEMASTER_INSERTS---
SELECT format('INSERT INTO "Rolemaster" ("Id", "rolename") VALUES (%L, %L);', "Id", "rolename")
FROM "Rolemaster" ORDER BY "rolename";

\echo ---GYMSUBSCRIPTIONPLAN_INSERTS---
SELECT format('INSERT INTO "GymSubscriptionPlan" ("id", "name", "description", "price", "durationDays", "features", "isActive", "createdAt", "updatedAt", "priceCurrency") VALUES (%L, %L, %L, %s, %s, %L, %s, %L, %L, %L);',
    id, name, description, price, "durationDays", features, "isActive", "createdAt", "updatedAt", "priceCurrency")
FROM "GymSubscriptionPlan" ORDER BY name;

\echo ---USER_ADMIN_INSERT---
SELECT format('INSERT INTO "User" ("id", "email", "password", "name", "isActive", "createdAt", "updatedAt", "roleId") VALUES (%L, %L, %L, %L, %s, %L, %L, %L);',
    id, email, password, name, "isActive", "createdAt", "updatedAt", "roleId")
FROM "User" WHERE email = 'admin@gymmanager.com';
