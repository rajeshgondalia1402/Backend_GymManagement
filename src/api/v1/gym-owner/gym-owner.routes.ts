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

export default router;
