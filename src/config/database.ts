import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import config from './env';

const { Pool } = pg;

class Database {
  private static instance: PrismaClient;
  private static pool: pg.Pool;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      // Create connection pool
      Database.pool = new Pool({
        connectionString: config.env.DATABASE_URL,
      });

      // Create Prisma adapter
      const adapter = new PrismaPg(Database.pool);

      // Create Prisma client with adapter
      Database.instance = new PrismaClient({
        adapter,
        log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return Database.instance;
  }

  public static async connect(): Promise<void> {
    try {
      await Database.getInstance().$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    await Database.getInstance().$disconnect();
    if (Database.pool) {
      await Database.pool.end();
    }
    console.log('👋 Database disconnected');
  }
}

export const prisma = Database.getInstance();
export default Database;
