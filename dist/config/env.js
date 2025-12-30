"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Config {
    constructor() {
        this.env = {
            PORT: parseInt(process.env.PORT || '5000', 10),
            NODE_ENV: process.env.NODE_ENV || 'development',
            DATABASE_URL: process.env.DATABASE_URL || '',
            JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret',
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
            JWT_EXPIRATION: process.env.JWT_EXPIRES_IN || '15m',
            JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
            RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
            RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        };
        this.isDevelopment = this.env.NODE_ENV === 'development';
        this.isProduction = this.env.NODE_ENV === 'production';
        this.validateConfig();
    }
    validateConfig() {
        const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
        const missing = requiredEnvVars.filter((key) => !process.env[key]);
        if (missing.length > 0 && this.isProduction) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
}
const config = new Config();
exports.default = config;
//# sourceMappingURL=env.js.map