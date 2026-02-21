import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  FRONTEND_URL: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
}

class Config {
  public env: EnvConfig;
  public isDevelopment: boolean;
  public isProduction: boolean;

  constructor() {
    this.env = {
      PORT: parseInt(process.env.PORT || '5000', 10),
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || '8d9f3a7c1b2e4f6g9h0jklmnopqrstuv',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '2a7c9e1f4h6k8m0pqrstuvwxyz123456',
      JWT_EXPIRATION: process.env.JWT_EXPIRES_IN || '15d',
      JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRES_IN || '15d',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
      RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    };

    this.isDevelopment = this.env.NODE_ENV === 'development';
    this.isProduction = this.env.NODE_ENV === 'production';

    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredEnvVars.filter((key) => !process.env[key]);

    if (missing.length > 0 && this.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

const config = new Config();
export default config;
