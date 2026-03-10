import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment-specific .env file first, then fall back to .env
const envFile = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
const defaultEnvFile = path.resolve(process.cwd(), '.env');

let loadedEnvFile: string;
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  loadedEnvFile = `.env.${NODE_ENV}`;
} else {
  dotenv.config({ path: defaultEnvFile });
  loadedEnvFile = '.env (fallback)';
}

console.log(`📁 Env file loaded: ${loadedEnvFile} | NODE_ENV: ${NODE_ENV}`);

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  FRONTEND_URL: string;
  CORS_ORIGINS: string[];
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
      CORS_ORIGINS: this.parseCorsOrigins(),
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
      RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    };

    this.isDevelopment = this.env.NODE_ENV === 'development';
    this.isProduction = this.env.NODE_ENV === 'production';

    this.validateConfig();
  }

  /**
   * Parse CORS origins from environment variables.
   * Supports:
   *   CORS_ORIGINS="https://domain1.com,https://domain2.com"  (comma-separated)
   *   Falls back to FRONTEND_URL + localhost defaults for development
   */
  private parseCorsOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS;
    if (raw) {
      // Comma-separated list of allowed origins
      return raw.split(',').map((o) => o.trim()).filter(Boolean);
    }

    // Fallback: FRONTEND_URL + localhost origins for dev convenience
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const origins = [frontendUrl];

    // In non-production, also allow common local dev ports
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      origins.push('http://localhost:3000', 'http://localhost:3005', 'http://localhost:5000', 'http://localhost:5173');
    }

    // De-duplicate
    return [...new Set(origins)];
  }

  private validateConfig(): void {
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredEnvVars.filter((key) => !process.env[key]);

    if (missing.length > 0 && this.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Production-specific validations
    if (this.isProduction) {
      if (this.env.JWT_SECRET.includes('CHANGE_ME') || this.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be a strong secret in production (min 32 chars). Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
      }
      if (this.env.JWT_REFRESH_SECRET.includes('CHANGE_ME') || this.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be a strong secret in production (min 32 chars).');
      }
      if (this.env.FRONTEND_URL.includes('localhost')) {
        console.warn('⚠️  WARNING: FRONTEND_URL contains "localhost" in production. Update it to your actual domain.');
      }
    }
  }
}

const config = new Config();
export default config;
