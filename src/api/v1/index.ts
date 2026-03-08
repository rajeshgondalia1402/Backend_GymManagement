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

export default router;
