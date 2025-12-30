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

## Default Credentials

| Role      | Email                    | Password   |
|-----------|--------------------------|------------|
| Admin     | admin@gymmanager.com     | admin123   |
| Gym Owner | owner@fitnesspro.com     | owner123   |
| Member    | alice@example.com        | member123  |
