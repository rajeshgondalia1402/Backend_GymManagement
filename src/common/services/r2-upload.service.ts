import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, getR2Config, isR2Configured } from '../../config/r2.config';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Folder structure for different upload types
export enum R2Folder {
  GYM_LOGOS = 'gym-logos',
  MEMBER_PHOTOS = 'member-photos',
  MEMBER_DOCUMENTS = 'member-documents',
  MEMBER_INQUIRY_PHOTOS = 'member-inquiry-photos',
  TRAINER_PHOTOS = 'trainer-photos',
  TRAINER_DOCUMENTS = 'trainer-documents',
  EXPENSE_ATTACHMENTS = 'expense-attachments',
}

// Allowed MIME types for images
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Allowed MIME types for documents (images + PDF)
const DOCUMENT_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  'application/pdf',
];

// Interface for upload result
export interface R2UploadResult {
  success: boolean;
  url: string;
  key: string;
  error?: string;
}

// Interface for file data
export interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Generate unique filename with UUID and timestamp
 */
export const generateUniqueFilename = (originalname: string, prefix: string): string => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Short UUID for readability
  return `${prefix}-${timestamp}-${uuid}${ext}`;
};

/**
 * Validate if file is an image
 */
export const isValidImage = (mimetype: string): boolean => {
  return IMAGE_MIME_TYPES.includes(mimetype.toLowerCase());
};

/**
 * Validate if file is a valid document (image or PDF)
 */
export const isValidDocument = (mimetype: string): boolean => {
  return DOCUMENT_MIME_TYPES.includes(mimetype.toLowerCase());
};

/**
 * Get Content-Type for the file
 */
const getContentType = (mimetype: string): string => {
  return mimetype || 'application/octet-stream';
};

/**
 * Build the public URL for the uploaded file
 */
const buildPublicUrl = (key: string): string => {
  const config = getR2Config();

  // If public URL is configured, use it
  if (config.publicUrl) {
    // Remove trailing slash if present
    const baseUrl = config.publicUrl.replace(/\/$/, '');
    return `${baseUrl}/${key}`;
  }

  // Fallback to R2 direct URL (requires public bucket or signed URLs)
  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${key}`;
};

/**
 * Upload a file to R2
 */
export const uploadToR2 = async (
  file: FileData,
  folder: R2Folder,
  prefix: string = 'file'
): Promise<R2UploadResult> => {
  if (!isR2Configured()) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'R2 is not configured. Please set environment variables.',
    };
  }

  try {
    const config = getR2Config();
    const client = getR2Client();

    // Generate unique filename
    const filename = generateUniqueFilename(file.originalname, prefix);
    const key = `${folder}/${filename}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: getContentType(file.mimetype),
      // Optional: Set cache control for images
      CacheControl: 'max-age=31536000', // 1 year
    });

    await client.send(command);

    const url = buildPublicUrl(key);

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('R2 Upload Error:', error);
    return {
      success: false,
      url: '',
      key: '',
      error: error instanceof Error ? error.message : 'Failed to upload file to R2',
    };
  }
};

/**
 * Delete a file from R2
 */
export const deleteFromR2 = async (keyOrUrl: string): Promise<boolean> => {
  if (!isR2Configured()) {
    console.warn('R2 is not configured. Cannot delete file.');
    return false;
  }

  try {
    const config = getR2Config();
    const client = getR2Client();

    // Extract key from URL if full URL is provided
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      // Parse URL to get the key
      const url = new URL(keyOrUrl);
      key = url.pathname.replace(/^\//, ''); // Remove leading slash

      // If the bucket name is in the path, remove it
      if (key.startsWith(config.bucketName + '/')) {
        key = key.substring(config.bucketName.length + 1);
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('R2 Delete Error:', error);
    return false;
  }
};

/**
 * Check if a file exists in R2
 */
export const fileExistsInR2 = async (key: string): Promise<boolean> => {
  if (!isR2Configured()) {
    return false;
  }

  try {
    const config = getR2Config();
    const client = getR2Client();

    const command = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
};

/**
 * Upload gym logo to R2
 */
export const uploadGymLogo = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidImage(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed for gym logos',
    };
  }
  return uploadToR2(file, R2Folder.GYM_LOGOS, 'gym-logo');
};

/**
 * Upload member photo to R2
 */
export const uploadMemberPhoto = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidImage(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed for member photos',
    };
  }
  return uploadToR2(file, R2Folder.MEMBER_PHOTOS, 'member-photo');
};

/**
 * Upload member document (ID proof) to R2
 */
export const uploadMemberDocument = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidDocument(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) and PDF documents are allowed',
    };
  }
  return uploadToR2(file, R2Folder.MEMBER_DOCUMENTS, 'member-doc');
};

/**
 * Upload member inquiry photo to R2
 */
export const uploadMemberInquiryPhoto = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidImage(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed for inquiry photos',
    };
  }
  return uploadToR2(file, R2Folder.MEMBER_INQUIRY_PHOTOS, 'member-inquiry-photo');
};

/**
 * Upload trainer photo to R2
 */
export const uploadTrainerPhoto = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidImage(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed for trainer photos',
    };
  }
  return uploadToR2(file, R2Folder.TRAINER_PHOTOS, 'trainer-photo');
};

/**
 * Upload trainer document (ID proof) to R2
 */
export const uploadTrainerDocument = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidDocument(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) and PDF documents are allowed',
    };
  }
  return uploadToR2(file, R2Folder.TRAINER_DOCUMENTS, 'trainer-doc');
};

/**
 * Upload expense attachment to R2
 */
export const uploadExpenseAttachment = async (file: FileData): Promise<R2UploadResult> => {
  if (!isValidDocument(file.mimetype)) {
    return {
      success: false,
      url: '',
      key: '',
      error: 'Only image files (JPEG, PNG, GIF, WebP) and PDF documents are allowed',
    };
  }
  return uploadToR2(file, R2Folder.EXPENSE_ATTACHMENTS, 'expense-attachment');
};

/**
 * Upload multiple expense attachments to R2
 */
export const uploadExpenseAttachments = async (files: FileData[]): Promise<R2UploadResult[]> => {
  const results = await Promise.all(
    files.map((file) => uploadExpenseAttachment(file))
  );
  return results;
};

/**
 * Delete old file from R2 (helper for update operations)
 */
export const deleteOldR2File = async (url: string | null | undefined): Promise<void> => {
  if (url && url.startsWith('http')) {
    await deleteFromR2(url);
  }
};

/**
 * Extract R2 key from a full URL
 */
export const extractKeyFromUrl = (url: string): string | null => {
  if (!url) return null;

  // If it's a local path, return null
  if (url.startsWith('/uploads/')) {
    return null;
  }

  try {
    const config = getR2Config();
    const urlObj = new URL(url);

    // Get the pathname and remove leading slash
    let key = urlObj.pathname.replace(/^\//, '');

    // If the bucket name is in the path, remove it
    if (key.startsWith(config.bucketName + '/')) {
      key = key.substring(config.bucketName.length + 1);
    }

    return key || null;
  } catch {
    return null;
  }
};

/**
 * Generate a presigned URL for downloading a file from R2
 * @param url - The R2 URL or key of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL or null if failed
 */
export const getPresignedDownloadUrl = async (
  url: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  if (!isR2Configured()) {
    console.warn('R2 is not configured. Cannot generate presigned URL.');
    return null;
  }

  // If it's a local path, return null (handle locally)
  if (url.startsWith('/uploads/')) {
    return null;
  }

  try {
    const config = getR2Config();
    const client = getR2Client();

    // Extract the key from the URL
    const key = extractKeyFromUrl(url);
    if (!key) {
      console.error('Could not extract key from URL:', url);
      return null;
    }

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
};

/**
 * Generate presigned URLs for multiple files
 */
export const getPresignedDownloadUrls = async (
  urls: string[],
  expiresIn: number = 3600
): Promise<{ original: string; presigned: string | null }[]> => {
  const results = await Promise.all(
    urls.map(async (url) => ({
      original: url,
      presigned: await getPresignedDownloadUrl(url, expiresIn),
    }))
  );
  return results;
};

export default {
  uploadToR2,
  deleteFromR2,
  fileExistsInR2,
  uploadGymLogo,
  uploadMemberPhoto,
  uploadMemberDocument,
  uploadMemberInquiryPhoto,
  uploadTrainerPhoto,
  uploadTrainerDocument,
  uploadExpenseAttachment,
  uploadExpenseAttachments,
  deleteOldR2File,
  getPresignedDownloadUrl,
  getPresignedDownloadUrls,
  extractKeyFromUrl,
  isValidImage,
  isValidDocument,
  R2Folder,
};
