import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

// ==================================================
// File Validation Functions
// ==================================================

// Allowed MIME types for images
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];

// Allowed MIME types for documents (images + PDF)
const ALLOWED_DOCUMENT_MIMES = [...ALLOWED_IMAGE_MIMES, 'application/pdf'];
const ALLOWED_DOCUMENT_EXTENSIONS = [...ALLOWED_IMAGE_EXTENSIONS, '.pdf'];

// File filter for images only
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

// File filter for documents (images + PDF)
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_DOCUMENT_MIMES.includes(file.mimetype) && ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) and PDF documents are allowed'));
  }
};

// ==================================================
// Memory Storage Configuration (for R2 uploads)
// ==================================================

// Using memory storage - files will be stored in memory as Buffer
// This is required for uploading to cloud storage (R2/S3)
const memoryStorage = multer.memoryStorage();

// ==================================================
// Multer Configurations
// ==================================================

/**
 * Gym Logo Upload Configuration
 * - Single file: gymLogo
 * - Max size: 5MB
 * - Images only
 */
export const uploadGymLogo = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('gymLogo');

/**
 * Member Inquiry Photo Upload Configuration
 * - Single file: memberPhoto
 * - Max size: 5MB
 * - Images only
 */
export const uploadMemberInquiryPhoto = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('memberPhoto');

/**
 * Member Files Upload Configuration (Photo + ID Document)
 * - Two fields: memberPhoto, idProofDocument
 * - Max size: 5MB per file
 * - memberPhoto: images only
 * - idProofDocument: images + PDF
 */
export const uploadMemberFiles = multer({
  storage: memoryStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.fieldname === 'memberPhoto') {
      imageFileFilter(req, file, cb);
    } else if (file.fieldname === 'idProofDocument') {
      documentFileFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).fields([
  { name: 'memberPhoto', maxCount: 1 },
  { name: 'idProofDocument', maxCount: 1 },
]);

/**
 * Trainer Files Upload Configuration (Photo + ID Document)
 * - Two fields: trainerPhoto, idProofDocument
 * - Max size: 5MB per file
 * - trainerPhoto: images only
 * - idProofDocument: images + PDF
 */
export const uploadTrainerFiles = multer({
  storage: memoryStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.fieldname === 'trainerPhoto') {
      imageFileFilter(req, file, cb);
    } else if (file.fieldname === 'idProofDocument') {
      documentFileFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).fields([
  { name: 'trainerPhoto', maxCount: 1 },
  { name: 'idProofDocument', maxCount: 1 },
]);

/**
 * Expense Attachments Upload Configuration
 * - Array field: attachments
 * - Max files: 5
 * - Max size: 10MB per file
 * - Images + PDF
 */
export const uploadExpenseAttachments = multer({
  storage: memoryStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for receipts/invoices
  },
}).array('attachments', 5);

/**
 * Hire Trainer Certificate Upload Configuration
 * - Single file: certificate
 * - Max size: 5MB
 * - Images + PDF
 */
export const uploadHireTrainerCertificate = multer({
  storage: memoryStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('certificate');

// ==================================================
// Error Handling Middleware
// ==================================================

/**
 * Middleware to handle multer errors
 */
export const handleUploadError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB',
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  } else if (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
  next();
};

// ==================================================
// Legacy Path Functions (for backward compatibility)
// These are kept for migration purposes
// ==================================================

export const getRelativeLogoPath = (filename: string): string => {
  return `/uploads/gym-logos/${filename}`;
};

export const getRelativeMemberInquiryPhotoPath = (filename: string): string => {
  return `/uploads/member-inquiry-photos/${filename}`;
};

export const getRelativeMemberPhotoPath = (filename: string): string => {
  return `/uploads/member-photos/${filename}`;
};

export const getRelativeMemberDocumentPath = (filename: string): string => {
  return `/uploads/member-documents/${filename}`;
};

export const getRelativeTrainerPhotoPath = (filename: string): string => {
  return `/uploads/trainer-photos/${filename}`;
};

export const getRelativeTrainerDocumentPath = (filename: string): string => {
  return `/uploads/trainer-documents/${filename}`;
};

export const getRelativeExpenseAttachmentPath = (filename: string): string => {
  return `/uploads/expense-attachments/${filename}`;
};

// ==================================================
// Legacy Delete Functions (for backward compatibility)
// These handle deletion of old local files during migration
// ==================================================

import fs from 'fs';

export const deleteOldLogo = (logoPath: string | null | undefined): void => {
  if (logoPath && !logoPath.startsWith('http')) {
    const fullPath = path.join(process.cwd(), logoPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }
  }
};

export const deleteOldMemberFile = (filePath: string | null | undefined): void => {
  if (filePath && !filePath.startsWith('http')) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error('Error deleting old member file:', error);
      }
    }
  }
};

export const deleteOldTrainerFile = (filePath: string | null | undefined): void => {
  if (filePath && !filePath.startsWith('http')) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error('Error deleting old trainer file:', error);
      }
    }
  }
};

export const deleteExpenseAttachment = (filePath: string | null | undefined): void => {
  if (filePath && !filePath.startsWith('http')) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error('Error deleting expense attachment:', error);
      }
    }
  }
};

export const deleteExpenseAttachments = (filePaths: string[]): void => {
  filePaths.forEach((filePath) => deleteExpenseAttachment(filePath));
};
