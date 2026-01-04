# Backend_GymManagement
Node.js PostgreSQL Prisma Backend for Gym Management System

## Setup

```bash
cd gym-management/backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL
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
npx prisma migrate dev

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
