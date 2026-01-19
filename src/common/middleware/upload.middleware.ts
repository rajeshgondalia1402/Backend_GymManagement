import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const gymLogosDir = path.join(uploadsDir, 'gym-logos');
const memberInquiryPhotosDir = path.join(uploadsDir, 'member-inquiry-photos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(gymLogosDir)) {
  fs.mkdirSync(gymLogosDir, { recursive: true });
}

if (!fs.existsSync(memberInquiryPhotosDir)) {
  fs.mkdirSync(memberInquiryPhotosDir, { recursive: true });
}

// Configure storage for gym logos
const gymLogoStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, gymLogosDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `gym-logo-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

// Multer configuration for gym logo uploads
export const uploadGymLogo = multer({
  storage: gymLogoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
}).single('gymLogo');

// Middleware to handle multer errors
export const handleUploadError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB',
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

// Utility function to delete old logo file
export const deleteOldLogo = (logoPath: string | null | undefined): void => {
  if (logoPath) {
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

// Get the relative path for storing in database
export const getRelativeLogoPath = (filename: string): string => {
  return `/uploads/gym-logos/${filename}`;
};

// Configure storage for member inquiry photos
const memberInquiryPhotoStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, memberInquiryPhotosDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `member-inquiry-photo-${uniqueSuffix}${ext}`);
  }
});

// Multer configuration for member inquiry photo uploads
export const uploadMemberInquiryPhoto = multer({
  storage: memberInquiryPhotoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
}).single('memberPhoto');

// Get the relative path for member inquiry photo
export const getRelativeMemberInquiryPhotoPath = (filename: string): string => {
  return `/uploads/member-inquiry-photos/${filename}`;
};

// =============================================
// Member Photo and Document Uploads
// =============================================

// Ensure member uploads directories exist
const memberPhotosDir = path.join(uploadsDir, 'member-photos');
const memberDocumentsDir = path.join(uploadsDir, 'member-documents');

if (!fs.existsSync(memberPhotosDir)) {
  fs.mkdirSync(memberPhotosDir, { recursive: true });
}

if (!fs.existsSync(memberDocumentsDir)) {
  fs.mkdirSync(memberDocumentsDir, { recursive: true });
}

// Configure storage for member photos
const memberPhotoStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, memberPhotosDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `member-photo-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for member documents (ID proof)
const memberDocumentStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, memberDocumentsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `member-doc-${uniqueSuffix}${ext}`);
  }
});

// File filter for documents (images + PDF)
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) and PDF documents are allowed'));
  }
};

// Multer configuration for member uploads (photo + document)
export const uploadMemberFiles = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      if (file.fieldname === 'memberPhoto') {
        cb(null, memberPhotosDir);
      } else if (file.fieldname === 'idProofDocument') {
        cb(null, memberDocumentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'memberPhoto') {
        cb(null, `member-photo-${uniqueSuffix}${ext}`);
      } else if (file.fieldname === 'idProofDocument') {
        cb(null, `member-doc-${uniqueSuffix}${ext}`);
      } else {
        cb(null, `file-${uniqueSuffix}${ext}`);
      }
    }
  }),
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
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
}).fields([
  { name: 'memberPhoto', maxCount: 1 },
  { name: 'idProofDocument', maxCount: 1 }
]);

// Get the relative path for member photo
export const getRelativeMemberPhotoPath = (filename: string): string => {
  return `/uploads/member-photos/${filename}`;
};

// Get the relative path for member document
export const getRelativeMemberDocumentPath = (filename: string): string => {
  return `/uploads/member-documents/${filename}`;
};

// Utility function to delete old member file
export const deleteOldMemberFile = (filePath: string | null | undefined): void => {
  if (filePath) {
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
