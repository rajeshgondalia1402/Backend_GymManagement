import { Router } from 'express';
import memberController from './member.controller';
import { authenticate, authorize, validate, updateProfileSchema } from '../../../common/middleware';

const router = Router();

// Apply authentication and member authorization to all routes
router.use(authenticate, authorize('MEMBER'));

/**
 * @swagger
 * /api/v1/member/dashboard:
 *   get:
 *     summary: Get member dashboard statistics
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard', memberController.getDashboard);

/**
 * @swagger
 * /api/v1/member/profile:
 *   get:
 *     summary: Get member profile
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', memberController.getProfile);

/**
 * @swagger
 * /api/v1/member/profile:
 *   put:
 *     summary: Update member profile
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               fitnessGoal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', validate(updateProfileSchema), memberController.updateProfile);

/**
 * @swagger
 * /api/v1/member/trainer:
 *   get:
 *     summary: Get assigned trainer
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer retrieved successfully
 *       404:
 *         description: No trainer assigned
 */
router.get('/trainer', memberController.getTrainer);

/**
 * @swagger
 * /api/v1/member/diet-plan:
 *   get:
 *     summary: Get active diet plan
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plan retrieved successfully
 */
router.get('/diet-plan', memberController.getDietPlan);

/**
 * @swagger
 * /api/v1/member/exercise-plans:
 *   get:
 *     summary: Get active exercise plans
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exercise plans retrieved successfully
 */
router.get('/exercise-plans', memberController.getExercisePlans);

/**
 * @swagger
 * /api/v1/member/membership:
 *   get:
 *     summary: Get membership details
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership retrieved successfully
 */
router.get('/membership', memberController.getMembership);

export default router;
