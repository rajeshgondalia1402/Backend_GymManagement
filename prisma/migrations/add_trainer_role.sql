-- Add TRAINER role to Rolemaster table if it doesn't exist
INSERT INTO "Rolemaster" ("Id", "rolename")
SELECT gen_random_uuid(), 'TRAINER'
WHERE NOT EXISTS (
    SELECT 1 FROM "Rolemaster" WHERE "rolename" = 'TRAINER'
);
