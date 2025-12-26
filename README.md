# Backend_GymManagement
Node js PostgreSQL Prisma migration


cd gym-management/backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
