/**
 * Migration Script: Move existing local images to Cloudflare R2
 *
 * This script migrates all existing locally stored images to Cloudflare R2
 * and updates the database with the new R2 URLs.
 *
 * Usage:
 *   npx ts-node scripts/migrate-images-to-r2.ts
 *
 * Requirements:
 *   - R2 environment variables must be configured in .env
 *   - Database must be accessible
 *   - Local upload folders must exist
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// Create S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Base path for uploads
const UPLOADS_BASE_PATH = path.join(process.cwd(), 'uploads');

// Stats tracking
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
};

/**
 * Upload a local file to R2
 */
async function uploadToR2(localPath: string, r2Key: string): Promise<string | null> {
  const fullLocalPath = path.join(process.cwd(), localPath);

  // Check if file exists
  if (!fs.existsSync(fullLocalPath)) {
    console.log(`  [SKIP] File not found: ${localPath}`);
    stats.skipped++;
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(fullLocalPath);
    const ext = path.extname(localPath).toLowerCase();

    // Determine content type
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000',
    });

    await r2Client.send(command);

    // Build public URL
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${r2Key}`
      : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${r2Key}`;

    console.log(`  [OK] Uploaded: ${localPath} -> ${r2Key}`);
    stats.success++;
    return publicUrl;
  } catch (error) {
    console.error(`  [FAIL] Error uploading ${localPath}:`, error);
    stats.failed++;
    return null;
  }
}

/**
 * Convert local path to R2 key
 */
function localPathToR2Key(localPath: string): string {
  // Remove /uploads/ prefix and use as key
  return localPath.replace(/^\/uploads\//, '');
}

/**
 * Check if a path is a local path (not already an R2 URL)
 */
function isLocalPath(pathOrUrl: string | null): boolean {
  if (!pathOrUrl) return false;
  return pathOrUrl.startsWith('/uploads/') && !pathOrUrl.startsWith('http');
}

/**
 * Migrate Gym Logos
 */
async function migrateGymLogos(): Promise<void> {
  console.log('\n=== Migrating Gym Logos ===');

  const gyms = await prisma.gym.findMany({
    where: { gymLogo: { not: null } },
    select: { id: true, gymLogo: true },
  });

  for (const gym of gyms) {
    if (!isLocalPath(gym.gymLogo)) {
      console.log(`  [SKIP] Already migrated or null: Gym ${gym.id}`);
      stats.skipped++;
      continue;
    }

    stats.total++;
    const r2Key = localPathToR2Key(gym.gymLogo!);
    const newUrl = await uploadToR2(gym.gymLogo!, r2Key);

    if (newUrl) {
      await prisma.gym.update({
        where: { id: gym.id },
        data: { gymLogo: newUrl },
      });
      console.log(`  [DB] Updated Gym ${gym.id}`);
    }
  }
}

/**
 * Migrate Member Photos and Documents
 */
async function migrateMemberFiles(): Promise<void> {
  console.log('\n=== Migrating Member Photos & Documents ===');

  const members = await prisma.member.findMany({
    where: {
      OR: [{ memberPhoto: { not: null } }, { idProofDocument: { not: null } }],
    },
    select: { id: true, memberPhoto: true, idProofDocument: true },
  });

  for (const member of members) {
    // Migrate photo
    if (isLocalPath(member.memberPhoto)) {
      stats.total++;
      const r2Key = localPathToR2Key(member.memberPhoto!);
      const newUrl = await uploadToR2(member.memberPhoto!, r2Key);

      if (newUrl) {
        await prisma.member.update({
          where: { id: member.id },
          data: { memberPhoto: newUrl },
        });
        console.log(`  [DB] Updated Member ${member.id} photo`);
      }
    }

    // Migrate document
    if (isLocalPath(member.idProofDocument)) {
      stats.total++;
      const r2Key = localPathToR2Key(member.idProofDocument!);
      const newUrl = await uploadToR2(member.idProofDocument!, r2Key);

      if (newUrl) {
        await prisma.member.update({
          where: { id: member.id },
          data: { idProofDocument: newUrl },
        });
        console.log(`  [DB] Updated Member ${member.id} document`);
      }
    }
  }
}

/**
 * Migrate Trainer Photos and Documents
 */
async function migrateTrainerFiles(): Promise<void> {
  console.log('\n=== Migrating Trainer Photos & Documents ===');

  const trainers = await prisma.trainer.findMany({
    where: {
      OR: [{ trainerPhoto: { not: null } }, { idProofDocument: { not: null } }],
    },
    select: { id: true, trainerPhoto: true, idProofDocument: true },
  });

  for (const trainer of trainers) {
    // Migrate photo
    if (isLocalPath(trainer.trainerPhoto)) {
      stats.total++;
      const r2Key = localPathToR2Key(trainer.trainerPhoto!);
      const newUrl = await uploadToR2(trainer.trainerPhoto!, r2Key);

      if (newUrl) {
        await prisma.trainer.update({
          where: { id: trainer.id },
          data: { trainerPhoto: newUrl },
        });
        console.log(`  [DB] Updated Trainer ${trainer.id} photo`);
      }
    }

    // Migrate document
    if (isLocalPath(trainer.idProofDocument)) {
      stats.total++;
      const r2Key = localPathToR2Key(trainer.idProofDocument!);
      const newUrl = await uploadToR2(trainer.idProofDocument!, r2Key);

      if (newUrl) {
        await prisma.trainer.update({
          where: { id: trainer.id },
          data: { idProofDocument: newUrl },
        });
        console.log(`  [DB] Updated Trainer ${trainer.id} document`);
      }
    }
  }
}

/**
 * Migrate Member Inquiry Photos
 */
async function migrateMemberInquiryPhotos(): Promise<void> {
  console.log('\n=== Migrating Member Inquiry Photos ===');

  const inquiries = await prisma.memberInquiry.findMany({
    where: { memberPhoto: { not: null } },
    select: { id: true, memberPhoto: true },
  });

  for (const inquiry of inquiries) {
    if (!isLocalPath(inquiry.memberPhoto)) {
      console.log(`  [SKIP] Already migrated or null: Inquiry ${inquiry.id}`);
      stats.skipped++;
      continue;
    }

    stats.total++;
    const r2Key = localPathToR2Key(inquiry.memberPhoto!);
    const newUrl = await uploadToR2(inquiry.memberPhoto!, r2Key);

    if (newUrl) {
      await prisma.memberInquiry.update({
        where: { id: inquiry.id },
        data: { memberPhoto: newUrl },
      });
      console.log(`  [DB] Updated Inquiry ${inquiry.id}`);
    }
  }
}

/**
 * Migrate Expense Attachments
 */
async function migrateExpenseAttachments(): Promise<void> {
  console.log('\n=== Migrating Expense Attachments ===');

  const attachments = await prisma.expenseAttachment.findMany({
    select: { id: true, filePath: true },
  });

  for (const attachment of attachments) {
    if (!isLocalPath(attachment.filePath)) {
      console.log(`  [SKIP] Already migrated or null: Attachment ${attachment.id}`);
      stats.skipped++;
      continue;
    }

    stats.total++;
    const r2Key = localPathToR2Key(attachment.filePath);
    const newUrl = await uploadToR2(attachment.filePath, r2Key);

    if (newUrl) {
      await prisma.expenseAttachment.update({
        where: { id: attachment.id },
        data: { filePath: newUrl },
      });
      console.log(`  [DB] Updated Attachment ${attachment.id}`);
    }
  }
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
  console.log('========================================');
  console.log('  Image Migration to Cloudflare R2');
  console.log('========================================');

  // Validate R2 configuration
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    console.error('\n[ERROR] R2 configuration is incomplete!');
    console.error('Please set the following environment variables:');
    console.error('  - R2_ACCOUNT_ID');
    console.error('  - R2_ACCESS_KEY_ID');
    console.error('  - R2_SECRET_ACCESS_KEY');
    console.error('  - R2_BUCKET_NAME');
    console.error('  - R2_PUBLIC_URL (optional but recommended)');
    process.exit(1);
  }

  console.log('\nConfiguration:');
  console.log(`  Account ID: ${R2_ACCOUNT_ID}`);
  console.log(`  Bucket: ${R2_BUCKET_NAME}`);
  console.log(`  Public URL: ${R2_PUBLIC_URL || '(not set)'}`);
  console.log(`  Uploads Path: ${UPLOADS_BASE_PATH}`);

  try {
    // Run migrations
    await migrateGymLogos();
    await migrateMemberFiles();
    await migrateTrainerFiles();
    await migrateMemberInquiryPhotos();
    await migrateExpenseAttachments();

    // Print summary
    console.log('\n========================================');
    console.log('  Migration Summary');
    console.log('========================================');
    console.log(`  Total files processed: ${stats.total}`);
    console.log(`  Successfully migrated: ${stats.success}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Skipped (not found or already migrated): ${stats.skipped}`);
    console.log('========================================\n');

    if (stats.failed > 0) {
      console.log('[WARNING] Some files failed to migrate. Please check the logs above.');
    } else {
      console.log('[SUCCESS] Migration completed successfully!');
    }
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main().catch(console.error);
