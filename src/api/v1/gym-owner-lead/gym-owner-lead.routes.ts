import { Router } from 'express';
import * as controller from './gym-owner-lead.controller';

const router = Router();

router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/register', controller.register);
router.post('/check-session', controller.checkSession);
router.post('/check-mobile', controller.checkMobile);
router.post('/resend-otp', controller.resendOtp);
router.post('/forgot-password', controller.forgotPassword);

export { router as gymOwnerLeadRoutes };
