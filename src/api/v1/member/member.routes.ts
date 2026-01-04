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

/**
 * @swagger
 * /api/v1/member/my-diet-plan:
 *   get:
 *     summary: Get personal diet plan (active)
 *     description: Retrieves the member's currently active personal diet plan created by the gym owner
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal diet plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     meals:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalCalories:
 *                       type: integer
 *                     notes:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     isActive:
 *                       type: boolean
 *       404:
 *         description: No active diet plan found
 */
router.get('/my-diet-plan', memberController.getMyDietPlan);

/**
 * @swagger
 * /api/v1/member/my-diet-plan/history:
 *   get:
 *     summary: Get diet plan history
 *     description: Retrieves all personal diet plans (past and present) for the member
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plan history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       meals:
 *                         type: array
 *                       totalCalories:
 *                         type: integer
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       isActive:
 *                         type: boolean
 */
router.get('/my-diet-plan/history', memberController.getMyDietPlanHistory);

/**
 * @swagger
 * /api/v1/member/my-supplements:
 *   get:
 *     summary: Get my supplements (PT members only)
 *     description: Retrieves all active supplements prescribed to the PT member
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Supplements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       dosage:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       timing:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       isActive:
 *                         type: boolean
 */
router.get('/my-supplements', memberController.getMySupplements);

/**
 * @swagger
 * /api/v1/member/my-pt-membership:
 *   get:
 *     summary: Get PT membership details
 *     description: Retrieves the member's Personal Training membership details including sessions count
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PT membership retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sessionsTotal:
 *                       type: integer
 *                       description: Total number of PT sessions purchased
 *                     sessionsUsed:
 *                       type: integer
 *                       description: Number of sessions used
 *                     sessionsRemaining:
 *                       type: integer
 *                       description: Remaining sessions
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     isActive:
 *                       type: boolean
 *                     trainer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         specialization:
 *                           type: string
 *       404:
 *         description: Not a PT member
 */
router.get('/my-pt-membership', memberController.getMyPTMembership);

export default router;
