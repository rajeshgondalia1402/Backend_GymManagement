# Backend_GymManagement
Node.js PostgreSQL Prisma Backend for Gym Management System

## Setup

```bash
cd gym-management/backend
npm install
# Edit .env with your DB credentials and settings
# Local: set DATABASE_URL to your local DB, NODE_ENV=development
# VPS:   set DATABASE_URL to production DB, NODE_ENV=production
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## After Merging Branches (Important!)

When merging branches that have Prisma schema changes, **always run these commands**:

```bash
# 1. Regenerate Prisma client (required after schema changes)
npx prisma generate

# 2. Apply pending migrations
npx prisma migrate dev --name add_course_package

# 3. If you get "drift detected" error, resolve with:
npx prisma migrate resolve --applied <migration_name>

# 4. Rebuild the project
npm run build
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Property 'X' does not exist on type` | Run `npx prisma generate` |
| `Drift detected` | Run `npx prisma migrate resolve --applied <migration_name>` |
| Database out of sync | Run `npx prisma migrate dev` or `npx prisma db push` |

## Default Credentials

| Role      | Email                    | Password   |
|-----------|--------------------------|------------|
| Admin     | admin@gymmanager.com     | admin123   |
| Gym Owner | owner@fitnesspro.com     | owner123   |
| Member    | alice@example.com        | member123  |


npx prisma migrate dev --name add_body_part_master

npx prisma db push
npx prisma db seed


Permanent Solution - Best Practices for Future
1. Always use prisma migrate dev to create migrations
This creates the migration AND records it in _prisma_migrations table.
- # After modifying schema.prisma, run:
npx prisma migrate dev --name descriptive_name

2. When merging branches with schema changes:
# After merging, always run these commands:
npx prisma generate          # Regenerate client
npx prisma migrate deploy    # Apply any pending migrations (for production)
# OR
npx prisma migrate dev       # For development (may prompt for reset if drift exists)

3. If you ever face drift again, resolve it with:# Mark a manually applied migration as applied:
npx prisma migrate resolve --applied <migration_name>

When merging dev → main in the future, always run:
npx prisma generate
npx prisma migrate dev (or migrate deploy for production)
npm run build

