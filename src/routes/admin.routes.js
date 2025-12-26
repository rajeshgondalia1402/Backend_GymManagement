const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin dashboard
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.get('/dashboard', adminController.getDashboard);

// Subscription Plans
/**
 * @openapi
 * /api/admin/subscription-plans:
 *   post:
 *     summary: Create a subscription plan
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       '201': { description: Created }
 *   get:
 *     summary: List subscription plans
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/subscription-plans', validate(schemas.createSubscriptionPlan), adminController.createSubscriptionPlan);
router.get('/subscription-plans', adminController.getAllSubscriptionPlans);

/**
 * @openapi
 * /api/admin/subscription-plans/{id}:
 *   put:
 *     summary: Update a subscription plan
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: Updated }
 *   delete:
 *     summary: Delete a subscription plan
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '204': { description: No Content }
 */
router.put('/subscription-plans/:id', validate(schemas.uuidParam), adminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', validate(schemas.uuidParam), adminController.deleteSubscriptionPlan);

// Gyms
/**
 * @openapi
 * /api/admin/gyms:
 *   post:
 *     summary: Create a gym
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       '201': { description: Created }
 *   get:
 *     summary: List gyms
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/gyms', validate(schemas.createGym), adminController.createGym);
router.get('/gyms', adminController.getAllGyms);

/**
 * @openapi
 * /api/admin/gyms/{id}:
 *   get:
 *     summary: Get a gym by id
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK }
 *   put:
 *     summary: Update a gym
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       '200': { description: Updated }
 *   delete:
 *     summary: Delete a gym
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '204': { description: No Content }
 */
router.get('/gyms/:id', validate(schemas.uuidParam), adminController.getGymById);
router.put('/gyms/:id', validate(schemas.uuidParam), adminController.updateGym);
router.delete('/gyms/:id', validate(schemas.uuidParam), adminController.deleteGym);
router.patch('/gyms/:id/toggle-status', validate(schemas.uuidParam), adminController.toggleGymStatus);
router.patch('/gyms/:id/assign-owner', validate(schemas.uuidParam), adminController.assignGymOwner);

// Gym Owners
/**
 * @openapi
 * /api/admin/gym-owners:
 *   post:
 *     summary: Create a gym owner
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       '201': { description: Created }
 *   get:
 *     summary: List gym owners
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/gym-owners', validate(schemas.createUser), adminController.createGymOwner);
router.get('/gym-owners', adminController.getAllGymOwners);

/**
 * @openapi
 * /api/admin/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active status
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK }
 */
router.patch('/users/:id/toggle-status', validate(schemas.uuidParam), adminController.toggleUserStatus);

module.exports = router;
