import { PrismaClient } from '@prisma/client';
import config from './env';

  private static instance: PrismaClient;
  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient();
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
    console.log('👋 Database disconnected');
  }
}

export const prismaClient = Database.getInstance();
export default Database;
