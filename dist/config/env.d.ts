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
declare class Config {
    env: EnvConfig;
    isDevelopment: boolean;
    isProduction: boolean;
    constructor();
    private validateConfig;
}
declare const config: Config;
export default config;
//# sourceMappingURL=env.d.ts.map