import { Router } from 'express';
import { authRoutes } from './auth';
import { adminRoutes } from './admin';
import { gymOwnerRoutes } from './gym-owner';
import { memberRoutes } from './member';
import { trainerRoutes } from './trainer';
import {
  gymOwnerDeviceRoutes,
  gymOwnerBiometricRoutes,
  gymOwnerAttendanceRoutes,
  attendanceKioskRoutes,
  memberAttendanceRoutes,
  adminAttendanceRoutes,
} from './attendance';
import { contactRoutes } from './contact';
import { hireTrainerRoutes } from './hire-trainer';
import { gymOwnerLeadRoutes } from './gym-owner-lead';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/gym-owner', gymOwnerRoutes);
router.use('/member', memberRoutes);
router.use('/trainer', trainerRoutes);

// Biometric Attendance Routes
router.use('/gym-owner/biometric-devices', gymOwnerDeviceRoutes);
router.use('/gym-owner/members', gymOwnerBiometricRoutes);
router.use('/gym-owner/attendance', gymOwnerAttendanceRoutes);
router.use('/attendance', attendanceKioskRoutes);
router.use('/member/attendance', memberAttendanceRoutes);
router.use('/admin/attendance', adminAttendanceRoutes);

// Public contact form (no auth required)
router.use('/contact', contactRoutes);

// Public hire trainer marketplace (no auth required)
router.use('/hire-trainer', hireTrainerRoutes);

// Public gym-owner lead (for hire-trainer contact flow, no auth required)
router.use('/gym-owner-lead', gymOwnerLeadRoutes);

export default router;
