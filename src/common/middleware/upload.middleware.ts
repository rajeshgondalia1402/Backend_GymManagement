import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const gymLogosDir = path.join(uploadsDir, 'gym-logos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(gymLogosDir)) {
  fs.mkdirSync(gymLogosDir, { recursive: true });
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
