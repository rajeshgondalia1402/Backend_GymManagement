import { Router } from 'express';
import memberController from './member.controller';
import { authenticate, authorize, validate, updateProfileSchema, paginationSchema } from '../../../common/middleware';

const router = Router();

// Apply authentication and member authorization to all routes
// Both MEMBER and PT_MEMBER roles can access member routes
router.use(authenticate, authorize('MEMBER', 'PT_MEMBER'));

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
 * /api/v1/member/dashboard-details:
 *   get:
 *     summary: Get comprehensive member dashboard with all details
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comprehensive dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberInfo:
 *                   type: object
 *                 membership:
 *                   type: object
 *                 fees:
 *                   type: object
 *                 nextPayment:
 *                   type: object
 *                 trainer:
 *                   type: object
 *                 todayExercise:
 *                   type: object
 *                 dietPlan:
 *                   type: object
 *                 gym:
 *                   type: object
 */
router.get('/dashboard-details', memberController.getComprehensiveDashboard);

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
 * /api/v1/member/my-diet-plan/list:
 *   get:
 *     summary: Get assigned diet plans list with pagination and search
 *     description: Retrieves all diet plans assigned to the member by gym owner with pagination and search filter
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter by diet template name, meal titles, or descriptions
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Diet plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           dietTemplateId:
 *                             type: string
 *                           dietTemplateName:
 *                             type: string
 *                           dietTemplateDescription:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                           isActive:
 *                             type: boolean
 *                           notes:
 *                             type: string
 *                           assignedBy:
 *                             type: string
 *                           meals:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 mealNo:
 *                                   type: integer
 *                                 title:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *                                 time:
 *                                   type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       404:
 *         description: Member not found
 */
router.get('/my-diet-plan/list', validate(paginationSchema, 'query'), memberController.getMyDietPlanList);

/**
 * @swagger
 * /api/v1/member/my-complete-details:
 *   get:
 *     summary: Get complete member details
 *     description: Retrieves comprehensive member information including personal details, membership info, package details, payment history, renewal history, and pending amounts
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     memberInfo:
 *                       type: object
 *                       description: Basic member information
 *                     gym:
 *                       type: object
 *                       description: Gym information
 *                     trainer:
 *                       type: object
 *                       description: Assigned trainer information
 *                     membership:
 *                       type: object
 *                       description: Current membership status and expiry details
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         status:
 *                           type: string
 *                         daysRemaining:
 *                           type: integer
 *                         daysSinceExpiry:
 *                           type: integer
 *                         isExpired:
 *                           type: boolean
 *                         expiryStatus:
 *                           type: string
 *                           enum: [ACTIVE, EXPIRING_SOON, EXPIRED]
 *                     currentPackage:
 *                       type: object
 *                       description: Current course package details
 *                     regularFees:
 *                       type: object
 *                       description: Regular membership fee structure
 *                     ptFees:
 *                       type: object
 *                       description: PT addon fee structure (if applicable)
 *                     paymentSummary:
 *                       type: object
 *                       description: Payment summary with totals and pending amounts
 *                       properties:
 *                         regular:
 *                           type: object
 *                           properties:
 *                             finalFees:
 *                               type: number
 *                             totalPaid:
 *                               type: number
 *                             pendingAmount:
 *                               type: number
 *                             paymentStatus:
 *                               type: string
 *                               enum: [PAID, PARTIAL, PENDING]
 *                         pt:
 *                           type: object
 *                         grandTotal:
 *                           type: object
 *                           properties:
 *                             totalFees:
 *                               type: number
 *                             totalPaid:
 *                               type: number
 *                             totalPending:
 *                               type: number
 *                             overallStatus:
 *                               type: string
 *                     paymentHistory:
 *                       type: array
 *                       description: All payment transactions
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           receiptNo:
 *                             type: string
 *                           paymentFor:
 *                             type: string
 *                             enum: [REGULAR, PT]
 *                           paymentDate:
 *                             type: string
 *                             format: date-time
 *                           paidAmount:
 *                             type: number
 *                           paymentMode:
 *                             type: string
 *                     renewalHistory:
 *                       type: array
 *                       description: Membership renewal history
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           renewalNumber:
 *                             type: string
 *                           renewalDate:
 *                             type: string
 *                             format: date-time
 *                           renewalType:
 *                             type: string
 *                           previousMembershipEnd:
 *                             type: string
 *                             format: date-time
 *                           newMembershipEnd:
 *                             type: string
 *                             format: date-time
 *                           package:
 *                             type: object
 *                           fees:
 *                             type: object
 *                           payment:
 *                             type: object
 *       404:
 *         description: Member not found
 */
router.get('/my-complete-details', memberController.getMyCompleteDetails);

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
