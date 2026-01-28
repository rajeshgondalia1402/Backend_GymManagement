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
  createExpenseSchema,
  updateExpenseSchema,
  expenseReportSchema,
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
  createMemberBalancePaymentSchema,
  updateMemberBalancePaymentSchema,
  createMembershipRenewalSchema,
  updateMembershipRenewalSchema,
  renewalPaginationSchema,
  // New PT Addon schemas
  addPTAddonSchema,
  removePTAddonSchema,
  uploadMemberFiles,
  uploadTrainerFiles,
  uploadExpenseAttachments,
  handleUploadError,
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
 *     tags: [Gym Owner - Trainers]
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
 *     tags: [Gym Owner - Trainers]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: integer
 *                 description: Years of experience
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               salary:
 *                 type: number
 *                 description: Monthly salary
 *               idProofType:
 *                 type: string
 *                 description: Type of ID proof (Aadhar, PAN, etc.)
 *               trainerPhoto:
 *                 type: string
 *                 format: binary
 *                 description: Passport size photo
 *               idProofDocument:
 *                 type: string
 *                 format: binary
 *                 description: ID proof document
 *     responses:
 *       201:
 *         description: Trainer created successfully
 */
router.post('/trainers', uploadTrainerFiles, handleUploadError, validate(createTrainerSchema), gymOwnerController.createTrainer.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/trainers/{id}:
 *   put:
 *     summary: Update a trainer
 *     tags: [Gym Owner - Trainers]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               salary:
 *                 type: number
 *               idProofType:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               trainerPhoto:
 *                 type: string
 *                 format: binary
 *               idProofDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Trainer updated successfully
 */
router.put('/trainers/:id', uploadTrainerFiles, handleUploadError, validate(idParamSchema, 'params'), validate(updateTrainerSchema), gymOwnerController.updateTrainer.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/trainers/{id}:
 *   delete:
 *     summary: Soft delete a trainer (set isActive to false)
 *     tags: [Gym Owner - Trainers]
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
 *         description: Trainer deactivated successfully
 */
router.delete('/trainers/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteTrainer.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/trainers/{id}/toggle-status:
 *   patch:
 *     summary: Toggle trainer active status (activate/deactivate)
 *     tags: [Gym Owner - Trainers]
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
 *     summary: Get all members with filters and sorting
 *     tags: [Gym Owner - Members]
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
 *         description: Universal search - searches in name, email, phone, memberId, address, occupation, emergency contact, health notes
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, firstName, email, memberId, phone, membershipStart, membershipEnd]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, InActive, Expired]
 *         description: Filter by member status - Active (membership currently valid, today between start/end dates), InActive (soft deleted records), Expired (membership end date has passed)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status (use status parameter instead for better control)
 *       - in: query
 *         name: memberType
 *         schema:
 *           type: string
 *           enum: [REGULAR, PT]
 *         description: Filter by member type
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Filter by gender
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *         description: Filter by blood group
 *       - in: query
 *         name: maritalStatus
 *         schema:
 *           type: string
 *         description: Filter by marital status
 *       - in: query
 *         name: smsFacility
 *         schema:
 *           type: boolean
 *         description: Filter by SMS facility enabled
 *       - in: query
 *         name: membershipStartFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter membership start date from (YYYY-MM-DD)
 *       - in: query
 *         name: membershipStartTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter membership start date to (YYYY-MM-DD)
 *       - in: query
 *         name: membershipEndFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter membership end date from (YYYY-MM-DD)
 *       - in: query
 *         name: membershipEndTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter membership end date to (YYYY-MM-DD)
 *       - in: query
 *         name: coursePackageId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course package ID
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 */
router.get('/members', validate(paginationSchema, 'query'), gymOwnerController.getMembers.bind(gymOwnerController));

router.get('/members/:id', validate(idParamSchema, 'params'), gymOwnerController.getMemberById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{id}/membership-details:
 *   get:
 *     summary: Get member membership details
 *     tags: [Gym Owner - Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member membership details retrieved successfully
 */
router.get('/members/:id/membership-details', validate(idParamSchema, 'params'), gymOwnerController.getMemberMembershipDetails.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members:
 *   post:
 *     summary: Create a new member
 *     tags: [Gym Owner - Members]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               altContactNo:
 *                 type: string
 *               address:
 *                 type: string
 *               gender:
 *                 type: string
 *               occupation:
 *                 type: string
 *               maritalStatus:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               anniversaryDate:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               healthNotes:
 *                 type: string
 *               idProofType:
 *                 type: string
 *               smsFacility:
 *                 type: boolean
 *               membershipStartDate:
 *                 type: string
 *                 description: Membership start date (ISO format)
 *               membershipEndDate:
 *                 type: string
 *                 description: Membership end date (ISO format)
 *               coursePackageId:
 *                 type: string
 *                 format: uuid
 *                 description: Course package ID
 *               packageFees:
 *                 type: number
 *                 description: Original package fees
 *               maxDiscount:
 *                 type: number
 *                 description: Maximum allowed discount
 *               afterDiscount:
 *                 type: number
 *                 description: Amount after applying max discount
 *               extraDiscount:
 *                 type: number
 *                 description: Additional extra discount
 *               finalFees:
 *                 type: number
 *                 description: Final fees after all discounts
 *               memberPhoto:
 *                 type: string
 *                 format: binary
 *               idProofDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Member created successfully
 */
router.post('/members', uploadMemberFiles, handleUploadError, validate(createMemberSchema), gymOwnerController.createMember.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{id}:
 *   put:
 *     summary: Update a member
 *     tags: [Gym Owner - Members]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               altContactNo:
 *                 type: string
 *               address:
 *                 type: string
 *               gender:
 *                 type: string
 *               occupation:
 *                 type: string
 *               maritalStatus:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               anniversaryDate:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               healthNotes:
 *                 type: string
 *               idProofType:
 *                 type: string
 *               smsFacility:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               membershipStartDate:
 *                 type: string
 *                 description: Membership start date (ISO format)
 *               membershipEndDate:
 *                 type: string
 *                 description: Membership end date (ISO format)
 *               coursePackageId:
 *                 type: string
 *                 format: uuid
 *                 description: Course package ID
 *               packageFees:
 *                 type: number
 *                 description: Original package fees
 *               maxDiscount:
 *                 type: number
 *                 description: Maximum allowed discount
 *               afterDiscount:
 *                 type: number
 *                 description: Amount after applying max discount
 *               extraDiscount:
 *                 type: number
 *                 description: Additional extra discount
 *               finalFees:
 *                 type: number
 *                 description: Final fees after all discounts
 *               memberPhoto:
 *                 type: string
 *                 format: binary
 *               idProofDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Member updated successfully
 */
router.put('/members/:id', uploadMemberFiles, handleUploadError, validate(idParamSchema, 'params'), validate(updateMemberSchema), gymOwnerController.updateMember.bind(gymOwnerController));

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

// =============================================
// Expense Management CRUD
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/expenses:
 *   get:
 *     summary: Get expenses with filters (Report API)
 *     tags: [Gym Owner - Expenses]
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
 *         description: Search in expense name, description, or expense group name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: expenseDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year (e.g., 2024)
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from date (ISO format)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter to date (ISO format)
 *       - in: query
 *         name: expenseGroupId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by expense group
 *       - in: query
 *         name: paymentMode
 *         schema:
 *           type: string
 *           enum: [CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, NET_BANKING, OTHER]
 *         description: Filter by payment mode
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully with summary
 *       401:
 *         description: Unauthorized
 */
router.get('/expenses', validate(expenseReportSchema, 'query'), gymOwnerController.getExpenses.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Gym Owner - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *       404:
 *         description: Expense not found
 */
router.get('/expenses/:id', validate(idParamSchema, 'params'), gymOwnerController.getExpenseById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Gym Owner - Expenses]
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
 *               - expenseGroupId
 *               - paymentMode
 *               - amount
 *             properties:
 *               expenseDate:
 *                 type: string
 *                 format: date-time
 *               name:
 *                 type: string
 *               expenseGroupId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               paymentMode:
 *                 type: string
 *                 enum: [CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, NET_BANKING, OTHER]
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       404:
 *         description: Expense group not found
 */
router.post('/expenses', uploadExpenseAttachments, handleUploadError, validate(createExpenseSchema), gymOwnerController.createExpense.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Gym Owner - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseDate:
 *                 type: string
 *                 format: date-time
 *               name:
 *                 type: string
 *               expenseGroupId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               paymentMode:
 *                 type: string
 *                 enum: [CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, NET_BANKING, OTHER]
 *               amount:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
router.put('/expenses/:id', uploadExpenseAttachments, handleUploadError, validate(idParamSchema, 'params'), validate(updateExpenseSchema), gymOwnerController.updateExpense.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/expenses/{id}:
 *   delete:
 *     summary: Soft delete an expense
 *     tags: [Gym Owner - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
router.delete('/expenses/:id', validate(idParamSchema, 'params'), gymOwnerController.deleteExpense.bind(gymOwnerController));

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
 * /api/v1/gym-owner/course-packages/active:
 *   get:
 *     summary: Get all active course packages (no pagination)
 *     description: Returns all active course packages for the gym owner without pagination. Useful for dropdowns and selection lists.
 *     tags: [Gym Owner - Course Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active course packages retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CoursePackage'
 */
router.get('/course-packages/active', gymOwnerController.getAllActiveCoursePackages.bind(gymOwnerController));

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
 *         name: coursePackageType
 *         schema:
 *           type: string
 *           enum: [REGULAR, PT]
 *         description: Filter by package type (REGULAR for gym membership, PT for personal training)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [packageName, fees, createdAt, coursePackageType]
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
 *               - months
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
 *               coursePackageType:
 *                 type: string
 *                 enum: [REGULAR, PT]
 *                 default: REGULAR
 *                 description: Type of package - REGULAR for gym membership, PT for personal training
 *               months:
 *                 type: integer
 *                 minimum: 1
 *                 description: Duration of the package in months
 *                 example: 3
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
 *               coursePackageType:
 *                 type: string
 *                 enum: [REGULAR, PT]
 *                 description: Type of package - REGULAR for gym membership, PT for personal training
 *               months:
 *                 type: integer
 *                 minimum: 1
 *                 description: Duration of the package in months
 *                 example: 3
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

/**
 * @swagger
 * /api/v1/gym-owner/course-packages/{id}/members:
 *   get:
 *     summary: Get course package with all active members
 *     description: Returns the course package details along with all active members who are subscribed to this package. Active members are those with isActive=true and membership end date in the future.
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
 *         description: Course package with active members retrieved successfully
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
 *                     package:
 *                       $ref: '#/components/schemas/CoursePackage'
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Member'
 *                     totalActiveMembers:
 *                       type: integer
 *                       description: Total count of active members in this package
 *       404:
 *         description: Course package not found
 */
router.get('/course-packages/:id/members', validate(idParamSchema, 'params'), gymOwnerController.getCoursePackageWithActiveMembers.bind(gymOwnerController));

// =============================================
// Member Balance Payment Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/member-balance-payments:
 *   get:
 *     summary: Get all balance payments for gym
 *     description: Returns paginated list of all balance payments for the gym owner's gym
 *     tags: [Gym Owner - Member Balance Payments]
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
 *         description: Search by receipt number, member name, or contact
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [paymentDate, receiptNo, paidFees, createdAt]
 *           default: paymentDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Balance payments retrieved successfully
 */
router.get('/member-balance-payments', validate(paginationSchema, 'query'), gymOwnerController.getAllMemberBalancePayments.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-balance-payments/{id}:
 *   get:
 *     summary: Get balance payment by ID
 *     description: Returns a specific balance payment by its ID
 *     tags: [Gym Owner - Member Balance Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Balance Payment ID
 *     responses:
 *       200:
 *         description: Balance payment retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get('/member-balance-payments/:id', validate(idParamSchema, 'params'), gymOwnerController.getMemberBalancePaymentById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/member-balance-payments/{id}:
 *   put:
 *     summary: Update balance payment
 *     description: Update an existing balance payment
 *     tags: [Gym Owner - Member Balance Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Balance Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *               contactNo:
 *                 type: string
 *               paidFees:
 *                 type: number
 *               payMode:
 *                 type: string
 *                 description: Payment mode (CASH, CARD, UPI, BANK_TRANSFER, CHEQUE)
 *               nextPaymentDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Balance payment updated successfully
 *       404:
 *         description: Payment not found
 */
router.put('/member-balance-payments/:id', validate(idParamSchema, 'params'), validate(updateMemberBalancePaymentSchema), gymOwnerController.updateMemberBalancePayment.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/balance-payments:
 *   get:
 *     summary: Get all balance payments for a member
 *     description: Returns payment summary (final fees, total paid, pending amount) and list of all payments for a specific member
 *     tags: [Gym Owner - Member Balance Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member balance payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     memberId:
 *                       type: string
 *                     memberName:
 *                       type: string
 *                     finalFees:
 *                       type: number
 *                       description: Total fees to be paid (from member profile)
 *                     totalPaid:
 *                       type: number
 *                       description: Sum of all payments made
 *                     pendingAmount:
 *                       type: number
 *                       description: Remaining amount to be paid
 *                     paymentCount:
 *                       type: integer
 *                       description: Number of payments made
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Member not found
 */
router.get('/members/:memberId/balance-payments', validate(memberIdParamSchema, 'params'), gymOwnerController.getMemberBalancePayments.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/balance-payments:
 *   post:
 *     summary: Create a new balance payment for a member
 *     description: Creates a new balance payment with auto-generated receipt number. The paidFees amount is added to the member's total paid amount.
 *     tags: [Gym Owner - Member Balance Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paidFees
 *               - payMode
 *             properties:
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of payment (defaults to now)
 *               contactNo:
 *                 type: string
 *                 description: Contact number (defaults to member's phone)
 *               paidFees:
 *                 type: number
 *                 description: Amount paid in this transaction
 *               payMode:
 *                 type: string
 *                 description: Payment mode (CASH, CARD, UPI, BANK_TRANSFER, CHEQUE)
 *               nextPaymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional next payment reminder date
 *               notes:
 *                 type: string
 *                 description: Optional payment notes
 *     responses:
 *       201:
 *         description: Balance payment created successfully
 *       404:
 *         description: Member not found
 */
router.post('/members/:memberId/balance-payments', validate(memberIdParamSchema, 'params'), validate(createMemberBalancePaymentSchema), gymOwnerController.createMemberBalancePayment.bind(gymOwnerController));

// =============================================
// Membership Renewal Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/membership-renewals:
 *   get:
 *     summary: Get all membership renewals with filters and pagination
 *     description: Retrieve all membership renewals for the gym with optional filters for search, renewal type, payment status, and date range
 *     tags: [Gym Owner - Membership Renewals]
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
 *         description: Search by renewal number, member name, email, phone, or member ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [renewalDate, createdAt, renewalNumber, memberName]
 *           default: renewalDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: renewalType
 *         schema:
 *           type: string
 *           enum: [STANDARD, EARLY, LATE, UPGRADE, DOWNGRADE]
 *         description: Filter by renewal type
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [PAID, PENDING, PARTIAL]
 *         description: Filter by payment status
 *       - in: query
 *         name: renewalDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter renewal date from (YYYY-MM-DD)
 *       - in: query
 *         name: renewalDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter renewal date to (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Membership renewals retrieved successfully
 */
router.get('/membership-renewals', validate(renewalPaginationSchema, 'query'), gymOwnerController.getMembershipRenewals.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/membership-renewals:
 *   post:
 *     summary: Create a new membership renewal for a member
 *     description: |
 *       Creates a new membership renewal record. This action:
 *       - Only works for Active or Expired members (not soft-deleted/InActive)
 *       - Creates a NEW ROW in the renewal history (historical tracking)
 *       - Updates the member's current membership start and end dates
 *       - Auto-generates a renewal number (REN-XXXXX)
 *       - Auto-determines renewal type (STANDARD, EARLY, LATE) if not provided
 *     tags: [Gym Owner - Membership Renewals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - newMembershipStart
 *               - newMembershipEnd
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the member to renew
 *               newMembershipStart:
 *                 type: string
 *                 format: date
 *                 description: New membership start date (ISO format)
 *               newMembershipEnd:
 *                 type: string
 *                 format: date
 *                 description: New membership end date (ISO format)
 *               renewalType:
 *                 type: string
 *                 enum: [STANDARD, EARLY, LATE, UPGRADE, DOWNGRADE]
 *                 description: Type of renewal (auto-detected if not provided)
 *               coursePackageId:
 *                 type: string
 *                 format: uuid
 *                 description: Course package ID for the renewal
 *               packageFees:
 *                 type: number
 *                 description: Original package fees
 *               maxDiscount:
 *                 type: number
 *                 description: Maximum allowed discount
 *               afterDiscount:
 *                 type: number
 *                 description: Amount after applying max discount
 *               extraDiscount:
 *                 type: number
 *                 description: Additional extra discount
 *               finalFees:
 *                 type: number
 *                 description: Final fees after all discounts
 *               paymentMode:
 *                 type: string
 *                 description: Payment mode (CASH, CARD, UPI, BANK_TRANSFER, etc.)
 *               paidAmount:
 *                 type: number
 *                 description: Amount paid at renewal
 *               notes:
 *                 type: string
 *                 description: Optional notes for the renewal
 *     responses:
 *       201:
 *         description: Membership renewed successfully
 *       400:
 *         description: Cannot renew inactive member
 *       404:
 *         description: Member not found
 */
router.post('/membership-renewals', validate(createMembershipRenewalSchema), gymOwnerController.createMembershipRenewal.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/membership-renewals/{id}:
 *   get:
 *     summary: Get a membership renewal by ID
 *     tags: [Gym Owner - Membership Renewals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Renewal ID
 *     responses:
 *       200:
 *         description: Membership renewal retrieved successfully
 *       404:
 *         description: Renewal not found
 */
router.get('/membership-renewals/:id', validate(idParamSchema, 'params'), gymOwnerController.getMembershipRenewalById.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/membership-renewals/{id}:
 *   put:
 *     summary: Update a membership renewal (mainly for payment updates)
 *     tags: [Gym Owner - Membership Renewals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Renewal ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [PAID, PENDING, PARTIAL]
 *                 description: Update payment status
 *               paymentMode:
 *                 type: string
 *                 description: Update payment mode
 *               paidAmount:
 *                 type: number
 *                 description: Update paid amount (auto-recalculates pending amount and status)
 *               notes:
 *                 type: string
 *                 description: Update notes
 *               isActive:
 *                 type: boolean
 *                 description: Soft delete/restore the renewal record
 *     responses:
 *       200:
 *         description: Membership renewal updated successfully
 *       404:
 *         description: Renewal not found
 */
router.put('/membership-renewals/:id', validate(idParamSchema, 'params'), validate(updateMembershipRenewalSchema), gymOwnerController.updateMembershipRenewal.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/renewal-history:
 *   get:
 *     summary: Get complete renewal history for a specific member
 *     description: Returns member details, current status, and all historical renewal records
 *     tags: [Gym Owner - Membership Renewals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member renewal history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     memberId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     currentMembershipStart:
 *                       type: string
 *                       format: date-time
 *                     currentMembershipEnd:
 *                       type: string
 *                       format: date-time
 *                     memberStatus:
 *                       type: string
 *                       enum: [Active, Expired, InActive]
 *                 totalRenewals:
 *                   type: integer
 *                   description: Total number of renewals
 *                 renewals:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Member not found
 */
router.get('/members/:memberId/renewal-history', validate(memberIdParamSchema, 'params'), gymOwnerController.getMemberRenewalHistory.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/reports/renewal-rate:
 *   get:
 *     summary: Get comprehensive renewal rate report for the gym
 *     description: |
 *       Returns detailed analytics about membership renewals including:
 *       - Total members, active, and expired counts
 *       - Overall renewal rate percentage
 *       - Breakdown by renewal type (STANDARD, EARLY, LATE, etc.)
 *       - Breakdown by payment status (PAID, PENDING, PARTIAL)
 *       - Monthly renewal trends for the last 12 months
 *       - Total revenue from renewals
 *       - Package popularity in renewals
 *     tags: [Gym Owner - Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Renewal rate report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMembers:
 *                   type: integer
 *                 totalActiveMembers:
 *                   type: integer
 *                 totalExpiredMembers:
 *                   type: integer
 *                 totalRenewals:
 *                   type: integer
 *                 renewalRate:
 *                   type: number
 *                   description: Percentage of members who have renewed
 *                 renewalsByType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       percentage:
 *                         type: number
 *                 renewalsByPaymentStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       totalAmount:
 *                         type: number
 *                 monthlyRenewals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       renewalCount:
 *                         type: integer
 *                       newMemberCount:
 *                         type: integer
 *                       expiredCount:
 *                         type: integer
 *                       renewalRate:
 *                         type: number
 *                 totalRenewalRevenue:
 *                   type: number
 *                 averageRenewalFees:
 *                   type: number
 *                 packageRenewalStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       packageId:
 *                         type: string
 *                       packageName:
 *                         type: string
 *                       renewalCount:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 */
router.get('/reports/renewal-rate', gymOwnerController.getRenewalRateReport.bind(gymOwnerController));

// =============================================
// PT Addon Management Routes
// =============================================

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/add-pt:
 *   post:
 *     summary: Add PT addon to existing member
 *     tags: [Gym Owner - PT Addon]
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
 *               - ptPackageName
 *               - trainerId
 *               - sessionsTotal
 *               - ptPackageFees
 *               - ptFinalFees
 *             properties:
 *               ptPackageName:
 *                 type: string
 *               trainerId:
 *                 type: string
 *               sessionsTotal:
 *                 type: integer
 *               sessionDuration:
 *                 type: integer
 *                 default: 60
 *               ptPackageFees:
 *                 type: number
 *               ptMaxDiscount:
 *                 type: number
 *               ptExtraDiscount:
 *                 type: number
 *               ptFinalFees:
 *                 type: number
 *               initialPayment:
 *                 type: number
 *               paymentMode:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               goals:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: PT addon added successfully
 */
router.post('/members/:memberId/add-pt', validate(memberIdParamSchema, 'params'), validate(addPTAddonSchema), gymOwnerController.addPTAddon.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/remove-pt:
 *   delete:
 *     summary: Remove PT addon from member
 *     tags: [Gym Owner - PT Addon]
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [COMPLETE, FORFEIT, CARRY_FORWARD]
 *                 description: How to handle remaining sessions
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: PT addon removed successfully
 */
router.delete('/members/:memberId/remove-pt', validate(memberIdParamSchema, 'params'), validate(removePTAddonSchema), gymOwnerController.removePTAddon.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/payment-summary:
 *   get:
 *     summary: Get combined payment summary for member (Regular + PT)
 *     tags: [Gym Owner - PT Addon]
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
 *         description: Payment summary retrieved successfully
 */
router.get('/members/:memberId/payment-summary', validate(memberIdParamSchema, 'params'), gymOwnerController.getMemberPaymentSummary.bind(gymOwnerController));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/session-credits:
 *   get:
 *     summary: Get session credits for a member
 *     tags: [Gym Owner - PT Addon]
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
 *         description: Session credits retrieved successfully
 */
router.get('/members/:memberId/session-credits', validate(memberIdParamSchema, 'params'), gymOwnerController.getMemberSessionCredits.bind(gymOwnerController));

export default router;
