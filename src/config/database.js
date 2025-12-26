const { PrismaClient } = require('@prisma/client');

const logLevels = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

let prisma;
if (process.env.ACCELERATE_URL) {
  prisma = new PrismaClient({ accelerateUrl: process.env.ACCELERATE_URL, log: logLevels });
} else {
  try {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter, log: logLevels });
  } catch (err) {
    console.error('Prisma requires a driver adapter or ACCELERATE_URL. Install @prisma/adapter-pg or set ACCELERATE_URL.');
    throw err;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
