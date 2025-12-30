import { PrismaClient } from '@prisma/client';
declare class Database {
    private static instance;
    private static pool;
    private constructor();
    static getInstance(): PrismaClient;
    static connect(): Promise<void>;
    static disconnect(): Promise<void>;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
export default Database;
//# sourceMappingURL=database.d.ts.map