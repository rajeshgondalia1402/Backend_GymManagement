"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const env_1 = __importDefault(require("./env"));
const { Pool } = pg_1.default;
class Database {
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.pool = new Pool({
                connectionString: env_1.default.env.DATABASE_URL,
            });
            const adapter = new adapter_pg_1.PrismaPg(Database.pool);
            Database.instance = new client_1.PrismaClient({
                adapter,
                log: env_1.default.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
            });
        }
        return Database.instance;
    }
    static async connect() {
        try {
            await Database.getInstance().$connect();
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    }
    static async disconnect() {
        await Database.getInstance().$disconnect();
        if (Database.pool) {
            await Database.pool.end();
        }
        console.log('👋 Database disconnected');
    }
}
exports.prisma = Database.getInstance();
exports.default = Database;
//# sourceMappingURL=database.js.map