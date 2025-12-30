import { Router } from 'express';
import { authRoutes } from './auth';
import { adminRoutes } from './admin';
import { gymOwnerRoutes } from './gym-owner';
import { memberRoutes } from './member';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/gym-owner', gymOwnerRoutes);
router.use('/member', memberRoutes);

export default router;
