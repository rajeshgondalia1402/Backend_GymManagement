import { Router } from 'express';
import gymOwnerController from './gym-owner.controller';
import {
  authenticate,
  authorize,
  validate,
  createTrainerSchema,
  updateTrainerSchema,
  createMemberSchema,
  updateMemberSchema,
  createDietPlanSchema,
  updateDietPlanSchema,
  createExercisePlanSchema,
  updateExercisePlanSchema,
  assignPlanSchema,
  idParamSchema,
  paginationSchema,
  createPTMemberSchema,
  updatePTMemberSchema,
  createSupplementSchema,
  updateSupplementSchema,
  createMemberDietPlanSchema,
  updateMemberDietPlanSchema,
  createInquirySchema,
  updateInquirySchema,
  memberIdParamSchema,
  ptMemberIdParamSchema,
  createExpenseGroupSchema,
  updateExpenseGroupSchema,
  createDesignationSchema,
  updateDesignationSchema,
  createBodyPartSchema,
  updateBodyPartSchema,
  createWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  createMemberInquirySchema,
  updateMemberInquirySchema,
  userIdParamSchema,
  createCoursePackageSchema,
  updateCoursePackageSchema,
} from '../../../common/middleware';

const router = Router();

// Apply authentication and gym owner authorization to all routes
router.use(authenticate, authorize('GYM_OWNER'));

/**
 * @swagger
 * /api/v1/gym-owner/dashboard:
 *   get:
 *     summary: Get gym owner dashboard statistics
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard', gymOwnerController.getDashboard.bind(gymOwnerController));

// Trainers
/**
 * @swagger
 * /api/v1/gym-owner/trainers:
 *   get:
 *     summary: Get all trainers
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainers retrieved successfully
 */
router.get('/trainers', validate(paginationSchema, 'query'), gymOwnerController.getTrainers.bind(gymOwnerController));

router.get('/trainers/:id', validate(idParamSchema, 'params'), gymOwnerController.getTrainerById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/trainers:
 *   post:
 *     summary: Create a new trainer
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Trainer created successfully
 */
router.post('/trainers', validate(createTrainerSchema), gymOwnerController.createTrainer.bind(gymOwnerController));

router.put('/trainers/:id', validate(idParamSchema, 'params'), validate(updateTrainerSchema), gymOwnerController.updateTrainer.bind(gymOwnerController));

router.delete('/trainers/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteTrainer.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/trainers/{id}/toggle-status:
 *   patch:
 *     summary: Toggle trainer active status
 *     tags: [Gym Owner]
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
 *         description: Trainer status toggled successfully
 */
router.patch('/trainers/:id/toggle-status', validate(idParamSchema, 'params'), gymOwnerController.toggleTrainerStatus.bind(gymOwnerController));

// Members
/**
 * @swagger
 * /api/v1/gym-owner/members:
 *   get:
 *     summary: Get all members
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 */
router.get('/members', validate(paginationSchema, 'query'), gymOwnerController.getMembers.bind(gymOwnerController));

router.get('/members/:id', validate(idParamSchema, 'params'), gymOwnerController.getMemberById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members:
 *   post:
 *     summary: Create a new member
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Member created successfully
 */
router.post('/members', validate(createMemberSchema), gymOwnerController.createMember.bind(gymOwnerController));

router.put('/members/:id', validate(idParamSchema, 'params'), validate(updateMemberSchema), gymOwnerController.updateMember.bind(gymOwnerController));

router.delete('/members/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteMember.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{id}/toggle-status:
 *   patch:
 *     summary: Toggle member active status
 *     tags: [Gym Owner]
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
 *         description: Member status toggled successfully
 */
router.patch('/members/:id/toggle-status', validate(idParamSchema, 'params'), gymOwnerController.toggleMemberStatus.bind(gymOwnerController));

// Diet Plans
/**
 * @swagger
 * /api/v1/gym-owner/diet-plans:
 *   get:
 *     summary: Get all diet plans
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plans retrieved successfully
 */
router.get('/diet-plans', validate(paginationSchema, 'query'), gymOwnerController.getDietPlans.bind(gymOwnerController));

router.get('/diet-plans/:id', validate(idParamSchema, 'params'), gymOwnerController.getDietPlanById.bind(gymOwnerController));

router.post('/diet-plans', validate(createDietPlanSchema), gymOwnerController.createDietPlan.bind(gymOwnerController));

router.put('/diet-plans/:id', validate(idParamSchema, 'params'), validate(updateDietPlanSchema), gymOwnerController.updateDietPlan.bind(gymOwnerController));

router.delete('/diet-plans/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteDietPlan.bind(gymOwnerController));

// Exercise Plans
/**
 * @swagger
 * /api/v1/gym-owner/exercise-plans:
 *   get:
 *     summary: Get all exercise plans
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exercise plans retrieved successfully
 */
router.get('/exercise-plans', validate(paginationSchema, 'query'), gymOwnerController.getExercisePlans.bind(gymOwnerController));

router.get('/exercise-plans/:id', validate(idParamSchema, 'params'), gymOwnerController.getExercisePlanById.bind(gymOwnerController));

router.post('/exercise-plans', validate(createExercisePlanSchema), gymOwnerController.createExercisePlan.bind(gymOwnerController));

router.put('/exercise-plans/:id', validate(idParamSchema, 'params'), validate(updateExercisePlanSchema), gymOwnerController.updateExercisePlan.bind(gymOwnerController));

router.delete('/exercise-plans/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteExercisePlan.bind(gymOwnerController));

// Assignments
/**
 * @swagger
 * /api/v1/gym-owner/assign-diet-plan:
 *   post:
 *     summary: Assign a diet plan to a member
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plan assigned successfully
 */
router.post('/assign-diet-plan', validate(assignPlanSchema), gymOwnerController.assignDietPlan.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/assign-exercise-plan:
 *   post:
 *     summary: Assign an exercise plan to a member
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exercise plan assigned successfully
 */
router.post('/assign-exercise-plan', validate(assignPlanSchema), gymOwnerController.assignExercisePlan.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/assign-trainer:
 *   post:
 *     summary: Assign a trainer to a member
 *     tags: [Gym Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer assigned successfully
 */
router.post('/assign-trainer', gymOwnerController.assignTrainer.bind(gymOwnerController));

// =============================================
// PT Members Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/pt-members:
 *   get:
 *     summary: Get all PT members
 *     tags: [Gym Owner - PT]
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
router.get('/pt-members', validate(paginationSchema, 'query'), gymOwnerController.getPTMembers.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/pt-members/{id}:
 *   get:
 *     summary: Get PT member by ID
 *     tags: [Gym Owner - PT]
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
router.get('/pt-members/:id', validate(idParamSchema, 'params'), gymOwnerController.getPTMemberById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/pt-members:
 *   post:
 *     summary: Create a new PT member
 *     tags: [Gym Owner - PT]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: PT Member created successfully
 */
router.post('/pt-members', validate(createPTMemberSchema), gymOwnerController.createPTMember.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/pt-members/{id}:
 *   put:
 *     summary: Update PT member
 *     tags: [Gym Owner - PT]
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
 *         description: PT Member updated successfully
 */
router.put('/pt-members/:id', validate(idParamSchema, 'params'), validate(updatePTMemberSchema), gymOwnerController.updatePTMember.bind(gymOwnerController));

// =============================================
// Supplements Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/supplements/{ptMemberId}:
 *   get:
 *     summary: Get supplements for a PT member
 *     tags: [Gym Owner - Supplements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ptMemberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplements retrieved successfully
 */
router.get('/supplements/:ptMemberId', validate(ptMemberIdParamSchema, 'params'), gymOwnerController.getSupplements.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/supplements/{ptMemberId}:
 *   post:
 *     summary: Create supplement for a PT member
 *     tags: [Gym Owner - Supplements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ptMemberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Supplement created successfully
 */
router.post('/supplements/:ptMemberId', validate(ptMemberIdParamSchema, 'params'), validate(createSupplementSchema), gymOwnerController.createSupplement.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/supplements/{id}:
 *   put:
 *     summary: Update supplement
 *     tags: [Gym Owner - Supplements]
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
 *         description: Supplement updated successfully
 */
router.put('/supplements/:id', validate(idParamSchema, 'params'), validate(updateSupplementSchema), gymOwnerController.updateSupplement.bind(gymOwnerController));

// =============================================
// Member Diet Plans Routes (per member)
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/diet-plans/{memberId}:
 *   get:
 *     summary: Get diet plans for a member
 *     tags: [Gym Owner - Member Diet]
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
 *         description: Member diet plans retrieved successfully
 */
router.get('/member-diet-plans/:memberId', validate(memberIdParamSchema, 'params'), gymOwnerController.getMemberDietPlans.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/diet-plans/{memberId}:
 *   post:
 *     summary: Create diet plan for a member
 *     tags: [Gym Owner - Member Diet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Member diet plan created successfully
 */
router.post('/member-diet-plans/:memberId', validate(memberIdParamSchema, 'params'), validate(createMemberDietPlanSchema), gymOwnerController.createMemberDietPlan.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/diet-plans/{id}:
 *   put:
 *     summary: Update member diet plan
 *     tags: [Gym Owner - Member Diet]
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
 *         description: Member diet plan updated successfully
 */
router.put('/member-diet-plans/:id', validate(idParamSchema, 'params'), validate(updateMemberDietPlanSchema), gymOwnerController.updateMemberDietPlan.bind(gymOwnerController));

// =============================================
// Inquiries Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/inquiries:
 *   get:
 *     summary: Get all inquiries
 *     tags: [Gym Owner - Inquiries]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, INTERESTED, NOT_INTERESTED, CONVERTED, FOLLOW_UP]
 *     responses:
 *       200:
 *         description: Inquiries retrieved successfully
 */
router.get('/inquiries', validate(paginationSchema, 'query'), gymOwnerController.getInquiries.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/inquiries:
 *   post:
 *     summary: Create a new inquiry
 *     tags: [Gym Owner - Inquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Inquiry created successfully
 */
router.post('/inquiries', validate(createInquirySchema), gymOwnerController.createInquiry.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/inquiries/{id}:
 *   put:
 *     summary: Update inquiry
 *     tags: [Gym Owner - Inquiries]
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
 *         description: Inquiry updated successfully
 */
router.put('/inquiries/:id', validate(idParamSchema, 'params'), validate(updateInquirySchema), gymOwnerController.updateInquiry.bind(gymOwnerController));

// =============================================
// Reports Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/reports/members:
 *   get:
 *     summary: Get member report
 *     tags: [Gym Owner - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member report retrieved successfully
 */
router.get('/reports/members', gymOwnerController.getMemberReport.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/reports/pt-progress:
 *   get:
 *     summary: Get PT progress report
 *     tags: [Gym Owner - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PT progress report retrieved successfully
 */
router.get('/reports/pt-progress', gymOwnerController.getPTProgressReport.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/reports/trainers:
 *   get:
 *     summary: Get trainer report
 *     tags: [Gym Owner - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer report retrieved successfully
 */
router.get('/reports/trainers', gymOwnerController.getTrainerReport.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Gym Owner - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue report retrieved successfully
 */
router.get('/reports/revenue', gymOwnerController.getRevenueReport.bind(gymOwnerController));

// Expense Group Master CRUD
/**
 * @swagger
 * /api/v1/gym-owner/expense-groups:
 *   get:
 *     summary: Get all expense groups for the gym
 *     tags: [Gym Owner - Expense Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense groups retrieved successfully
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
 *                     $ref: '#/components/schemas/ExpenseGroup'
 */
router.get('/expense-groups', gymOwnerController.getExpenseGroups.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expense-groups/{id}:
 *   get:
 *     summary: Get expense group by ID
 *     tags: [Gym Owner - Expense Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense Group ID
 *     responses:
 *       200:
 *         description: Expense group retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseGroup'
 *       404:
 *         description: Expense group not found
 */
router.get('/expense-groups/:id', validate(idParamSchema, 'params'), gymOwnerController.getExpenseGroupById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expense-groups:
 *   post:
 *     summary: Create a new expense group
 *     tags: [Gym Owner - Expense Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expenseGroupName
 *             properties:
 *               expenseGroupName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the expense group (unique per gym)
 *     responses:
 *       201:
 *         description: Expense group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseGroup'
 *       409:
 *         description: Expense group with this name already exists
 */
router.post('/expense-groups', validate(createExpenseGroupSchema), gymOwnerController.createExpenseGroup.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expense-groups/{id}:
 *   put:
 *     summary: Update an expense group
 *     tags: [Gym Owner - Expense Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expenseGroupName
 *             properties:
 *               expenseGroupName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the expense group (unique per gym)
 *     responses:
 *       200:
 *         description: Expense group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseGroup'
 *       404:
 *         description: Expense group not found
 *       409:
 *         description: Expense group with this name already exists
 */
router.put('/expense-groups/:id', validate(idParamSchema, 'params'), validate(updateExpenseGroupSchema), gymOwnerController.updateExpenseGroup.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expense-groups/{id}:
 *   delete:
 *     summary: Delete an expense group (hard delete)
 *     tags: [Gym Owner - Expense Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense Group ID
 *     responses:
 *       200:
 *         description: Expense group deleted successfully
 *       404:
 *         description: Expense group not found
 */
router.delete('/expense-groups/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteExpenseGroup.bind(gymOwnerController));

// Designation Master CRUD
/**
 * @swagger
 * /api/v1/gym-owner/designations:
 *   get:
 *     summary: Get all designations for the gym
 *     tags: [Gym Owner - Designations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Designations retrieved successfully
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
 *                     $ref: '#/components/schemas/Designation'
 */
router.get('/designations', gymOwnerController.getDesignations.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/designations/{id}:
 *   get:
 *     summary: Get designation by ID
 *     tags: [Gym Owner - Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Designation ID
 *     responses:
 *       200:
 *         description: Designation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Designation'
 *       404:
 *         description: Designation not found
 */
router.get('/designations/:id', validate(idParamSchema, 'params'), gymOwnerController.getDesignationById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/designations:
 *   post:
 *     summary: Create a new designation
 *     tags: [Gym Owner - Designations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - designationName
 *             properties:
 *               designationName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the designation (unique per gym)
 *     responses:
 *       201:
 *         description: Designation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Designation'
 *       409:
 *         description: Designation with this name already exists
 */
router.post('/designations', validate(createDesignationSchema), gymOwnerController.createDesignation.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/designations/{id}:
 *   put:
 *     summary: Update a designation
 *     tags: [Gym Owner - Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Designation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - designationName
 *             properties:
 *               designationName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the designation (unique per gym)
 *     responses:
 *       200:
 *         description: Designation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Designation'
 *       404:
 *         description: Designation not found
 *       409:
 *         description: Designation with this name already exists
 */
router.put('/designations/:id', validate(idParamSchema, 'params'), validate(updateDesignationSchema), gymOwnerController.updateDesignation.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/designations/{id}:
 *   delete:
 *     summary: Delete a designation (hard delete)
 *     tags: [Gym Owner - Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Designation ID
 *     responses:
 *       200:
 *         description: Designation deleted successfully
 *       404:
 *         description: Designation not found
 */
router.delete('/designations/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteDesignation.bind(gymOwnerController));

// Body Part Master CRUD
/**
 * @swagger
 * /api/v1/gym-owner/body-parts:
 *   get:
 *     summary: Get all body parts for the gym
 *     tags: [Gym Owner - Body Parts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Body parts retrieved successfully
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
 *                     $ref: '#/components/schemas/BodyPart'
 */
router.get('/body-parts', gymOwnerController.getBodyParts.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/body-parts/{id}:
 *   get:
 *     summary: Get body part by ID
 *     tags: [Gym Owner - Body Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Body Part ID
 *     responses:
 *       200:
 *         description: Body part retrieved successfully
 *       404:
 *         description: Body part not found
 */
router.get('/body-parts/:id', validate(idParamSchema, 'params'), gymOwnerController.getBodyPartById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/body-parts:
 *   post:
 *     summary: Create a new body part
 *     tags: [Gym Owner - Body Parts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bodyPartName
 *             properties:
 *               bodyPartName:
 *                 type: string
 *                 description: Body part name (e.g., Chest, Back, Legs)
 *                 example: Chest
 *               description:
 *                 type: string
 *                 description: Description of the body part
 *     responses:
 *       201:
 *         description: Body part created successfully
 *       409:
 *         description: Body part with this name already exists
 */
router.post('/body-parts', validate(createBodyPartSchema), gymOwnerController.createBodyPart.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/body-parts/{id}:
 *   put:
 *     summary: Update a body part
 *     tags: [Gym Owner - Body Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Body Part ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bodyPartName:
 *                 type: string
 *                 description: Body part name
 *               description:
 *                 type: string
 *                 description: Description of the body part
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Body part updated successfully
 *       404:
 *         description: Body part not found
 *       409:
 *         description: Body part with this name already exists
 */
router.put('/body-parts/:id', validate(idParamSchema, 'params'), validate(updateBodyPartSchema), gymOwnerController.updateBodyPart.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/body-parts/{id}:
 *   delete:
 *     summary: Delete a body part
 *     tags: [Gym Owner - Body Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Body Part ID
 *     responses:
 *       200:
 *         description: Body part deleted successfully
 *       404:
 *         description: Body part not found
 */
router.delete('/body-parts/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteBodyPart.bind(gymOwnerController));

// Workout Exercise Master CRUD
/**
 * @swagger
 * /api/v1/gym-owner/workout-exercises:
 *   get:
 *     summary: Get all workout exercises for the gym
 *     tags: [Gym Owner - Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout exercises retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkoutExercise'
 */
router.get('/workout-exercises', gymOwnerController.getWorkoutExercises.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/workout-exercises/{id}:
 *   get:
 *     summary: Get workout exercise by ID
 *     tags: [Gym Owner - Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout Exercise ID
 *     responses:
 *       200:
 *         description: Workout exercise retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutExercise'
 *       404:
 *         description: Workout exercise not found
 */
router.get('/workout-exercises/:id', validate(idParamSchema, 'params'), gymOwnerController.getWorkoutExerciseById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/workout-exercises:
 *   post:
 *     summary: Create a new workout exercise
 *     tags: [Gym Owner - Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bodyPartId
 *               - exerciseName
 *             properties:
 *               bodyPartId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the body part this exercise belongs to
 *               exerciseName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the exercise (unique per gym)
 *               shortCode:
 *                 type: string
 *                 maxLength: 20
 *                 description: Short code for the exercise
 *               description:
 *                 type: string
 *                 description: Description of the exercise
 *     responses:
 *       201:
 *         description: Workout exercise created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutExercise'
 *       404:
 *         description: Body part not found
 *       409:
 *         description: Workout exercise with this name already exists
 */
router.post('/workout-exercises', validate(createWorkoutExerciseSchema), gymOwnerController.createWorkoutExercise.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/workout-exercises/{id}:
 *   put:
 *     summary: Update a workout exercise
 *     tags: [Gym Owner - Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout Exercise ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bodyPartId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the body part this exercise belongs to
 *               exerciseName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the exercise (unique per gym)
 *               shortCode:
 *                 type: string
 *                 maxLength: 20
 *                 description: Short code for the exercise
 *               description:
 *                 type: string
 *                 description: Description of the exercise
 *               isActive:
 *                 type: boolean
 *                 description: Whether the exercise is active
 *     responses:
 *       200:
 *         description: Workout exercise updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutExercise'
 *       404:
 *         description: Workout exercise or body part not found
 *       409:
 *         description: Workout exercise with this name already exists
 */
router.put('/workout-exercises/:id', validate(idParamSchema, 'params'), validate(updateWorkoutExerciseSchema), gymOwnerController.updateWorkoutExercise.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/workout-exercises/{id}/toggle-status:
 *   patch:
 *     summary: Toggle workout exercise active status
 *     tags: [Gym Owner - Workout Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workout Exercise ID
 *     responses:
 *       200:
 *         description: Workout exercise status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutExercise'
 *       404:
 *         description: Workout exercise not found
 */
router.patch('/workout-exercises/:id/toggle-status', validate(idParamSchema, 'params'), gymOwnerController.toggleWorkoutExerciseStatus.bind(gymOwnerController));

// Member Inquiry Routes
/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries:
 *   get:
 *     summary: Get all member inquiries for the gym
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by full name, contact no, or address
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Member inquiries retrieved successfully
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
 *                     $ref: '#/components/schemas/MemberInquiry'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/member-inquiries', validate(paginationSchema, 'query'), gymOwnerController.getMemberInquiries.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries/by-user/{userId}:
 *   get:
 *     summary: Get all member inquiries by user (login) ID
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID (Login ID)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Member inquiries retrieved successfully
 */
router.get('/member-inquiries/by-user/:userId', validate(userIdParamSchema, 'params'), validate(paginationSchema, 'query'), gymOwnerController.getMemberInquiriesByUserId.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries/{id}:
 *   get:
 *     summary: Get a member inquiry by ID
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member Inquiry ID
 *     responses:
 *       200:
 *         description: Member inquiry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberInquiry'
 *       404:
 *         description: Member inquiry not found
 */
router.get('/member-inquiries/:id', validate(idParamSchema, 'params'), gymOwnerController.getMemberInquiryById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries:
 *   post:
 *     summary: Create a new member inquiry
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - contactNo
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 description: Full name of the inquiry member
 *               contactNo:
 *                 type: string
 *                 minLength: 10
 *                 description: Contact number
 *               inquiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of inquiry
 *               dob:
 *                 type: string
 *                 format: date-time
 *                 description: Date of birth
 *               followUp:
 *                 type: boolean
 *                 default: false
 *                 description: Follow up checkbox
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 description: Follow up date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 description: Gender
 *               address:
 *                 type: string
 *                 description: Address
 *               heardAbout:
 *                 type: string
 *                 description: How they heard about the gym
 *               comments:
 *                 type: string
 *                 description: Comments
 *               memberPhoto:
 *                 type: string
 *                 description: Member photo URL or base64 string
 *               height:
 *                 type: number
 *                 description: Height in cm
 *               weight:
 *                 type: number
 *                 description: Weight in kg
 *               referenceName:
 *                 type: string
 *                 description: Reference name (empty allowed)
 *     responses:
 *       201:
 *         description: Member inquiry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberInquiry'
 */
router.post('/member-inquiries', validate(createMemberInquirySchema), gymOwnerController.createMemberInquiry.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries/{id}:
 *   put:
 *     summary: Update a member inquiry
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member Inquiry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *               contactNo:
 *                 type: string
 *                 minLength: 10
 *               inquiryDate:
 *                 type: string
 *                 format: date-time
 *               dob:
 *                 type: string
 *                 format: date-time
 *               followUp:
 *                 type: boolean
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               address:
 *                 type: string
 *               heardAbout:
 *                 type: string
 *               comments:
 *                 type: string
 *               memberPhoto:
 *                 type: string
 *                 description: Member photo URL or base64 string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               referenceName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Member inquiry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberInquiry'
 *       404:
 *         description: Member inquiry not found
 */
router.put('/member-inquiries/:id', validate(idParamSchema, 'params'), validate(updateMemberInquirySchema), gymOwnerController.updateMemberInquiry.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries/{id}:
 *   delete:
 *     summary: Delete a member inquiry
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member Inquiry ID
 *     responses:
 *       200:
 *         description: Member inquiry deleted successfully
 *       404:
 *         description: Member inquiry not found
 */
router.delete('/member-inquiries/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteMemberInquiry.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-inquiries/{id}/toggle-status:
 *   patch:
 *     summary: Toggle member inquiry active status
 *     tags: [Gym Owner - Member Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member Inquiry ID
 *     responses:
 *       200:
 *         description: Member inquiry status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberInquiry'
 *       404:
 *         description: Member inquiry not found
 */
router.patch('/member-inquiries/:id/toggle-status', validate(idParamSchema, 'params'), gymOwnerController.toggleMemberInquiryStatus.bind(gymOwnerController));

// =============================================
// Course Package Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/course-packages:
 *   get:
 *     summary: Get all course packages for the gym
 *     tags: [Gym Owner - Course Packages]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by package name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [packageName, fees, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Course packages retrieved successfully
 */
router.get('/course-packages', validate(paginationSchema, 'query'), gymOwnerController.getCoursePackages.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/course-packages/{id}:
 *   get:
 *     summary: Get course package by ID
 *     tags: [Gym Owner - Course Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course Package ID
 *     responses:
 *       200:
 *         description: Course package retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursePackage'
 *       404:
 *         description: Course package not found
 */
router.get('/course-packages/:id', validate(idParamSchema, 'params'), gymOwnerController.getCoursePackageById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/course-packages:
 *   post:
 *     summary: Create a new course package
 *     tags: [Gym Owner - Course Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageName
 *               - fees
 *             properties:
 *               packageName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the course package (unique per gym)
 *                 example: "Premium Monthly"
 *               description:
 *                 type: string
 *                 description: Description of the course package
 *                 example: "Full access to all gym facilities"
 *               fees:
 *                 type: number
 *                 minimum: 0
 *                 description: Package fees
 *                 example: 2500
 *               maxDiscount:
 *                 type: number
 *                 minimum: 0
 *                 description: Maximum discount allowed
 *                 example: 500
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, AMOUNT]
 *                 default: PERCENTAGE
 *                 description: Type of discount (PERCENTAGE or AMOUNT)
 *     responses:
 *       201:
 *         description: Course package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursePackage'
 *       409:
 *         description: Course package with this name already exists
 */
router.post('/course-packages', validate(createCoursePackageSchema), gymOwnerController.createCoursePackage.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/course-packages/{id}:
 *   put:
 *     summary: Update a course package
 *     tags: [Gym Owner - Course Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course Package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the course package (unique per gym)
 *               description:
 *                 type: string
 *                 description: Description of the course package
 *               fees:
 *                 type: number
 *                 minimum: 0
 *                 description: Package fees
 *               maxDiscount:
 *                 type: number
 *                 minimum: 0
 *                 description: Maximum discount allowed
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, AMOUNT]
 *                 description: Type of discount
 *               isActive:
 *                 type: boolean
 *                 description: Whether the package is active
 *     responses:
 *       200:
 *         description: Course package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursePackage'
 *       404:
 *         description: Course package not found
 *       409:
 *         description: Course package with this name already exists
 */
router.put('/course-packages/:id', validate(idParamSchema, 'params'), validate(updateCoursePackageSchema), gymOwnerController.updateCoursePackage.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/course-packages/{id}:
 *   delete:
 *     summary: Soft delete a course package (sets isActive to false)
 *     tags: [Gym Owner - Course Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course Package ID
 *     responses:
 *       200:
 *         description: Course package deleted successfully
 *       404:
 *         description: Course package not found
 */
router.delete('/course-packages/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteCoursePackage.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/course-packages/{id}/toggle-status:
 *   patch:
 *     summary: Toggle course package active status
 *     tags: [Gym Owner - Course Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course Package ID
 *     responses:
 *       200:
 *         description: Course package status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursePackage'
 *       404:
 *         description: Course package not found
 */
router.patch('/course-packages/:id/toggle-status', validate(idParamSchema, 'params'), gymOwnerController.toggleCoursePackageStatus.bind(gymOwnerController));

export default router;
