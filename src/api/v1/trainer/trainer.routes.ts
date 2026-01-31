// =============================================
// Trainer Routes - API Endpoints
// =============================================

import { Router } from 'express';
import { trainerController } from './trainer.controller';
import { authenticate, authorize } from '../../../common/middleware';

const router = Router();

// All routes require authentication and TRAINER role
router.use(authenticate);
router.use(authorize('TRAINER'));

// =============================================
// Profile Routes
// =============================================

/**
 * @swagger
 * /api/v1/trainer/profile:
 *   get:
 *     summary: Get trainer's own profile
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', trainerController.getProfile.bind(trainerController));

// =============================================
// Member Management Routes
// =============================================

/**
 * @swagger
 * /api/v1/trainer/members:
 *   get:
 *     summary: Get all members assigned to this trainer
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 */
router.get('/members', trainerController.getAssignedMembers.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/members/{memberId}:
 *   get:
 *     summary: Get a specific member's details
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member details retrieved successfully
 */
router.get('/members/:memberId', trainerController.getMemberDetails.bind(trainerController));

// =============================================
// Diet Plan Routes
// =============================================

/**
 * @swagger
 * /api/v1/trainer/diet-plans:
 *   get:
 *     summary: Get all diet plans for trainer's gym
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plans retrieved successfully
 */
router.get('/diet-plans', trainerController.getDietPlans.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/diet-plans:
 *   post:
 *     summary: Create a new diet plan
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - meals
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               calories:
 *                 type: integer
 *               meals:
 *                 type: object
 *     responses:
 *       201:
 *         description: Diet plan created successfully
 */
router.post('/diet-plans', trainerController.createDietPlan.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/diet-plans/{id}:
 *   put:
 *     summary: Update a diet plan
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               calories:
 *                 type: integer
 *               meals:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Diet plan updated successfully
 */
router.put('/diet-plans/:id', trainerController.updateDietPlan.bind(trainerController));

// =============================================
// Exercise Plan Routes
// =============================================

/**
 * @swagger
 * /api/v1/trainer/exercise-plans:
 *   get:
 *     summary: Get all exercise plans for trainer's gym
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exercise plans retrieved successfully
 */
router.get('/exercise-plans', trainerController.getExercisePlans.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/exercise-plans:
 *   post:
 *     summary: Create a new exercise plan
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - exercises
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               exercises:
 *                 type: object
 *     responses:
 *       201:
 *         description: Exercise plan created successfully
 */
router.post('/exercise-plans', trainerController.createExercisePlan.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/exercise-plans/{id}:
 *   put:
 *     summary: Update an exercise plan
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               exercises:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Exercise plan updated successfully
 */
router.put('/exercise-plans/:id', trainerController.updateExercisePlan.bind(trainerController));

// =============================================
// Plan Assignment Routes
// =============================================

/**
 * @swagger
 * /api/v1/trainer/members/{memberId}/diet-plans:
 *   post:
 *     summary: Assign a diet plan to a member
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dietPlanId
 *             properties:
 *               dietPlanId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Diet plan assigned successfully
 */
router.post('/members/:memberId/diet-plans', trainerController.assignDietPlan.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/members/{memberId}/exercise-plans:
 *   post:
 *     summary: Assign an exercise plan to a member
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exercisePlanId
 *             properties:
 *               exercisePlanId:
 *                 type: string
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Exercise plan assigned successfully
 */
router.post('/members/:memberId/exercise-plans', trainerController.assignExercisePlan.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/members/{memberId}/diet-assignments:
 *   get:
 *     summary: Get member's diet assignments
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diet assignments retrieved successfully
 */
router.get('/members/:memberId/diet-assignments', trainerController.getMemberDietAssignments.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/members/{memberId}/exercise-assignments:
 *   get:
 *     summary: Get member's exercise assignments
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise assignments retrieved successfully
 */
router.get('/members/:memberId/exercise-assignments', trainerController.getMemberExerciseAssignments.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/diet-assignments/{assignmentId}:
 *   delete:
 *     summary: Remove a diet assignment
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diet assignment removed successfully
 */
router.delete('/diet-assignments/:assignmentId', trainerController.removeDietAssignment.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/exercise-assignments/{assignmentId}:
 *   delete:
 *     summary: Remove an exercise assignment
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise assignment removed successfully
 */
router.delete('/exercise-assignments/:assignmentId', trainerController.removeExerciseAssignment.bind(trainerController));

// =============================================
// PT Member Routes
// =============================================

/**
 * @swagger
 * /api/v1/trainer/pt-members:
 *   get:
 *     summary: Get PT members assigned to this trainer
 *     tags: [Trainer - PT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PT Members retrieved successfully
 */
router.get('/pt-members', trainerController.getPTMembers.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/pt-members/{id}:
 *   get:
 *     summary: Get PT member by ID
 *     tags: [Trainer - PT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PT Member retrieved successfully
 */
router.get('/pt-members/:id', trainerController.getPTMemberById.bind(trainerController));

// =============================================
// Diet Plan Routes (Read-Only)
// =============================================

/**
 * @swagger
 * /api/v1/trainer/pt-members/{ptMemberId}/diet-plans:
 *   get:
 *     summary: Get diet plans for a PT member (read-only)
 *     description: Trainers can only view diet plans assigned to their PT members. They cannot create or modify diet plans.
 *     tags: [Trainer - Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ptMemberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The PT Member ID
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       planName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       calories:
 *                         type: integer
 *                       meals:
 *                         type: array
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       isActive:
 *                         type: boolean
 *       403:
 *         description: PT Member not assigned to this trainer
 */
router.get('/pt-members/:ptMemberId/diet-plans', trainerController.getDietPlanForPTMember.bind(trainerController));

// =============================================
// Supplement Routes (Read-Only)
// =============================================

/**
 * @swagger
 * /api/v1/trainer/pt-members/{ptMemberId}/supplements:
 *   get:
 *     summary: Get supplements for a PT member (read-only)
 *     description: Trainers can only view supplements assigned to their PT members. They cannot create or modify supplements.
 *     tags: [Trainer - Supplements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ptMemberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The PT Member ID
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
 *       403:
 *         description: PT Member not assigned to this trainer
 */
router.get('/pt-members/:ptMemberId/supplements', trainerController.getSupplementsForPTMember.bind(trainerController));

// =============================================
// Salary Settlement Routes (Read-Only)
// =============================================

/**
 * @swagger
 * /api/v1/trainer/salary-settlements:
 *   get:
 *     summary: Get trainer's own salary settlements
 *     description: Trainers can view their salary settlements sent by gym owner. Read-only access.
 *     tags: [Trainer - Salary Settlement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         description: Filter from date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *         description: Filter to date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Salary settlements retrieved successfully
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
 *                           salaryMonth:
 *                             type: string
 *                           monthlySalary:
 *                             type: number
 *                           presentDays:
 *                             type: integer
 *                           absentDays:
 *                             type: integer
 *                           calculatedSalary:
 *                             type: number
 *                           incentiveAmount:
 *                             type: number
 *                           finalPayableAmount:
 *                             type: number
 *                           paymentMode:
 *                             type: string
 *                           salarySentDate:
 *                             type: string
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalSettlements:
 *                           type: integer
 *                         totalEarnings:
 *                           type: number
 *                         totalIncentives:
 *                           type: number
 */
router.get('/salary-settlements', trainerController.getMySalarySettlements.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/salary-settlements/{id}:
 *   get:
 *     summary: Get salary settlement by ID
 *     description: Get detailed view of a specific salary settlement
 *     tags: [Trainer - Salary Settlement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Settlement ID
 *     responses:
 *       200:
 *         description: Salary settlement retrieved successfully
 *       404:
 *         description: Salary settlement not found
 */
router.get('/salary-settlements/:id', trainerController.getMySalarySettlementById.bind(trainerController));

/**
 * @swagger
 * /api/v1/trainer/salary-settlements/{id}/slip:
 *   get:
 *     summary: Generate salary slip for own settlement
 *     description: |
 *       Returns complete salary slip data for PDF generation.
 *       Trainer can only access their own salary slips.
 *     tags: [Trainer - Salary Settlement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Settlement ID
 *     responses:
 *       200:
 *         description: Salary slip generated successfully
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
 *                     slipId:
 *                       type: string
 *                     slipNumber:
 *                       type: string
 *                     salaryPeriod:
 *                       type: string
 *                     gymDetails:
 *                       type: object
 *                     trainerDetails:
 *                       type: object
 *                     attendance:
 *                       type: object
 *                     earnings:
 *                       type: object
 *                     netPayableAmount:
 *                       type: number
 *                     netPayableInWords:
 *                       type: string
 *                     paymentDetails:
 *                       type: object
 *       404:
 *         description: Salary settlement not found
 */
router.get('/salary-settlements/:id/slip', trainerController.getMySalarySlip.bind(trainerController));

export default router;
