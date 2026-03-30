import { Router } from 'express';
import * as controller from './hire-trainer.controller';
import { uploadHireTrainerCertificate, handleUploadError } from '../../../common/middleware/upload.middleware';

const router = Router();

// OTP & Verification (public, no auth)
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/check-verification', controller.checkVerification);

// Draft management
router.post('/save-step', controller.saveStep);
router.post('/submit', controller.submitApplication);
router.post('/resume', controller.resumeDraft);

// File upload
router.post('/upload-certificate', uploadHireTrainerCertificate, handleUploadError, controller.uploadCertificate);

// Search & profiles
router.get('/search', controller.searchTrainers);
router.get('/:id', controller.getTrainerProfile);

export { router as hireTrainerRoutes };
