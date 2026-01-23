// Script to populate passwords for existing trainers
// Run with: npx ts-node prisma/populate-trainer-passwords.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function populateTrainerPasswords() {
    console.log('🔄 Starting to populate trainer passwords...\n');

    // Create connection pool
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(pool);

    // Create Prisma client with adapter
    const prisma = new PrismaClient({ adapter });

    try {
        // Find all trainers without a password
        const trainersWithoutPassword = await prisma.trainer.findMany({
            where: {
                OR: [
                    { password: null },
                    { password: '' }
                ]
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        console.log(`Found ${trainersWithoutPassword.length} trainers without password\n`);

        if (trainersWithoutPassword.length === 0) {
            console.log('✅ All trainers already have passwords set!');
            return;
        }

        // Update each trainer with a default password
        for (const trainer of trainersWithoutPassword) {
            // Generate a simple default password based on trainer name
            // Format: FirstName@123 (e.g., "John@123")
            const firstName = trainer.user.name.split(' ')[0];
            const defaultPassword = `${firstName}@123`;

            await prisma.trainer.update({
                where: { id: trainer.id },
                data: { password: defaultPassword }
            });

            console.log(`✅ Updated trainer: ${trainer.user.name} (${trainer.user.email}) -> Password: ${defaultPassword}`);
        }

        console.log(`\n✅ Successfully updated ${trainersWithoutPassword.length} trainer(s) with passwords!`);
        console.log('\n📝 Note: Default password format is "FirstName@123" (e.g., John@123)');

    } catch (error) {
        console.error('❌ Error populating passwords:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

populateTrainerPasswords();
