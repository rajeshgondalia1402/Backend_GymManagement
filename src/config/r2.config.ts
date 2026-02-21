import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 Configuration
// R2 uses S3-compatible API, so we use AWS SDK with custom endpoint

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

// Get R2 configuration from environment variables
export const getR2Config = (): R2Config => {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
  const bucketName = process.env.R2_BUCKET_NAME || '';
  const publicUrl = process.env.R2_PUBLIC_URL || '';

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.warn('R2 configuration is incomplete. File uploads will fail.');
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
};

// Create S3 client configured for Cloudflare R2
export const createR2Client = (): S3Client => {
  const config = getR2Config();

  return new S3Client({
    region: 'auto', // R2 uses 'auto' for region
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

// Singleton instance of the R2 client
let r2Client: S3Client | null = null;

export const getR2Client = (): S3Client => {
  if (!r2Client) {
    r2Client = createR2Client();
  }
  return r2Client;
};

// Check if R2 is configured
export const isR2Configured = (): boolean => {
  const config = getR2Config();
  return !!(config.accountId && config.accessKeyId && config.secretAccessKey && config.bucketName);
};

export default {
  getR2Config,
  createR2Client,
  getR2Client,
  isR2Configured,
};
