import { Router } from 'express';
import adminController from './admin.controller';
import {
  authenticate,
  authorize,
  validate,
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  createGymSchema,
  updateGymSchema,
  createGymOwnerSchema,
  idParamSchema,
  paginationSchema,
} from '../../../common/middleware';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard', adminController.getDashboard);

// Subscription Plans
/**
 * @swagger
 * /api/v1/admin/subscription-plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Admin]
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
 *         description: Search term
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 */
router.get('/subscription-plans', validate(paginationSchema, 'query'), adminController.getSubscriptionPlans);

/**
 * @swagger
 * /api/v1/admin/subscription-plans/{id}:
 *   get:
 *     summary: Get subscription plan by ID
 *     tags: [Admin]
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
 *         description: Subscription plan retrieved successfully
 *       404:
 *         description: Subscription plan not found
 */
router.get('/subscription-plans/:id', validate(idParamSchema, 'params'), adminController.getSubscriptionPlanById);

/**
 * @swagger
 * /api/v1/admin/subscription-plans:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubscriptionPlan'
 *     responses:
 *       201:
 *         description: Subscription plan created successfully
 */
router.post('/subscription-plans', validate(createSubscriptionPlanSchema), adminController.createSubscriptionPlan);

/**
 * @swagger
 * /api/v1/admin/subscription-plans/{id}:
 *   put:
 *     summary: Update a subscription plan
 *     tags: [Admin]
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
 *             $ref: '#/components/schemas/UpdateSubscriptionPlan'
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 */
router.put('/subscription-plans/:id', validate(idParamSchema, 'params'), validate(updateSubscriptionPlanSchema), adminController.updateSubscriptionPlan);

/**
 * @swagger
 * /api/v1/admin/subscription-plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan
 *     tags: [Admin]
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
 *         description: Subscription plan deleted successfully
 */
router.delete('/subscription-plans/:id', validate(idParamSchema, 'params'), adminController.deleteSubscriptionPlan);

// Gyms
/**
 * @swagger
 * /api/v1/admin/gyms:
 *   get:
 *     summary: Get all gyms
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gyms retrieved successfully
 */
router.get('/gyms', validate(paginationSchema, 'query'), adminController.getGyms);

/**
 * @swagger
 * /api/v1/admin/gyms/{id}:
 *   get:
 *     summary: Get gym by ID
 *     tags: [Admin]
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
 *         description: Gym retrieved successfully
 */
router.get('/gyms/:id', validate(idParamSchema, 'params'), adminController.getGymById);

/**
 * @swagger
 * /api/v1/admin/gyms:
 *   post:
 *     summary: Create a new gym
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGym'
 *     responses:
 *       201:
 *         description: Gym created successfully
 */
router.post('/gyms', validate(createGymSchema), adminController.createGym);

/**
 * @swagger
 * /api/v1/admin/gyms/{id}:
 *   put:
 *     summary: Update a gym
 *     tags: [Admin]
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
 *         description: Gym updated successfully
 */
router.put('/gyms/:id', validate(idParamSchema, 'params'), validate(updateGymSchema), adminController.updateGym);

/**
 * @swagger
 * /api/v1/admin/gyms/{id}:
 *   delete:
 *     summary: Delete a gym
 *     tags: [Admin]
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
 *         description: Gym deleted successfully
 */
router.delete('/gyms/:id', validate(idParamSchema, 'params'), adminController.deleteGym);

/**
 * @swagger
 * /api/v1/admin/gyms/{id}/toggle-status:
 *   patch:
 *     summary: Toggle gym active status
 *     tags: [Admin]
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
 *         description: Gym status toggled successfully
 */
router.patch('/gyms/:id/toggle-status', validate(idParamSchema, 'params'), adminController.toggleGymStatus);

// Gym Owners
/**
 * @swagger
 * /api/v1/admin/gym-owners:
 *   get:
 *     summary: Get all gym owners
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gym owners retrieved successfully
 */
router.get('/gym-owners', validate(paginationSchema, 'query'), adminController.getGymOwners);

/**
 * @swagger
 * /api/v1/admin/gym-owners:
 *   post:
 *     summary: Create a new gym owner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGymOwner'
 *     responses:
 *       201:
 *         description: Gym owner created successfully
 */
router.post('/gym-owners', validate(createGymOwnerSchema), adminController.createGymOwner);

/**
 * @swagger
 * /api/v1/admin/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [Admin]
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
 *         description: User status toggled successfully
 */
router.patch('/users/:id/toggle-status', validate(idParamSchema, 'params'), adminController.toggleUserStatus);

export default router;
