const express = require('express');
const router = express.Router();
const gymOwnerController = require('../controllers/gymOwner.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');

// All routes require authentication and GYM_OWNER role
router.use(authenticate, authorize('GYM_OWNER'));

// Dashboard
/**
 * @openapi
 * /api/gym-owner/dashboard:
 *   get:
 *     summary: Gym owner dashboard
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.get('/dashboard', gymOwnerController.getDashboard.bind(gymOwnerController));

// Trainers
/**
 * @openapi
 * /api/gym-owner/trainers:
 *   post:
 *     summary: Create trainer
 *     tags:
 *       - GymOwner
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
 *     summary: List trainers
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/trainers', validate(schemas.createTrainer), gymOwnerController.createTrainer.bind(gymOwnerController));
router.get('/trainers', gymOwnerController.getAllTrainers.bind(gymOwnerController));

/**
 * @openapi
 * /api/gym-owner/trainers/{id}:
 *   get:
 *     summary: Get trainer by id
 *     tags:
 *       - GymOwner
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
 *     summary: Update trainer
 *     tags:
 *       - GymOwner
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
 *     summary: Delete trainer
 *     tags:
 *       - GymOwner
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
router.get('/trainers/:id', validate(schemas.uuidParam), gymOwnerController.getTrainerById.bind(gymOwnerController));
router.put('/trainers/:id', validate(schemas.uuidParam), gymOwnerController.updateTrainer.bind(gymOwnerController));
router.delete('/trainers/:id', validate(schemas.uuidParam), gymOwnerController.deleteTrainer.bind(gymOwnerController));

// Members
/**
 * @openapi
 * /api/gym-owner/members:
 *   post:
 *     summary: Create member
 *     tags:
 *       - GymOwner
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
 *     summary: List members
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/members', validate(schemas.createMember), gymOwnerController.createMember.bind(gymOwnerController));
router.get('/members', gymOwnerController.getAllMembers.bind(gymOwnerController));

/**
 * @openapi
 * /api/gym-owner/members/{id}:
 *   get:
 *     summary: Get member by id
 *     tags:
 *       - GymOwner
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
 *     summary: Update member
 *     tags:
 *       - GymOwner
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
 *     summary: Delete member
 *     tags:
 *       - GymOwner
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
router.get('/members/:id', validate(schemas.uuidParam), gymOwnerController.getMemberById.bind(gymOwnerController));
router.put('/members/:id', validate(schemas.uuidParam), gymOwnerController.updateMember.bind(gymOwnerController));
router.delete('/members/:id', validate(schemas.uuidParam), gymOwnerController.deleteMember.bind(gymOwnerController));

// Diet Plans
/**
 * @openapi
 * /api/gym-owner/diet-plans:
 *   post:
 *     summary: Create diet plan
 *     tags:
 *       - GymOwner
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
 *     summary: List diet plans
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/diet-plans', validate(schemas.createDietPlan), gymOwnerController.createDietPlan.bind(gymOwnerController));
router.get('/diet-plans', gymOwnerController.getAllDietPlans.bind(gymOwnerController));
router.put('/diet-plans/:id', validate(schemas.uuidParam), gymOwnerController.updateDietPlan.bind(gymOwnerController));
router.delete('/diet-plans/:id', validate(schemas.uuidParam), gymOwnerController.deleteDietPlan.bind(gymOwnerController));

// Exercise Plans
/**
 * @openapi
 * /api/gym-owner/exercise-plans:
 *   post:
 *     summary: Create exercise plan
 *     tags:
 *       - GymOwner
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
 *     summary: List exercise plans
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: OK }
 */
router.post('/exercise-plans', validate(schemas.createExercisePlan), gymOwnerController.createExercisePlan.bind(gymOwnerController));
router.get('/exercise-plans', gymOwnerController.getAllExercisePlans.bind(gymOwnerController));
router.put('/exercise-plans/:id', validate(schemas.uuidParam), gymOwnerController.updateExercisePlan.bind(gymOwnerController));
router.delete('/exercise-plans/:id', validate(schemas.uuidParam), gymOwnerController.deleteExercisePlan.bind(gymOwnerController));

// Assignments
/**
 * @openapi
 * /api/gym-owner/assign/trainer:
 *   post:
 *     summary: Assign trainer to member
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       '200': { description: Assigned }
 */
router.post('/assign/trainer', validate(schemas.assignTrainer), gymOwnerController.assignTrainer.bind(gymOwnerController));
router.post('/assign/diet-plan', validate(schemas.assignDietPlan), gymOwnerController.assignDietPlan.bind(gymOwnerController));
router.post('/assign/exercise-plan', validate(schemas.assignExercisePlan), gymOwnerController.assignExercisePlan.bind(gymOwnerController));
/**
 * @openapi
 * /api/gym-owner/assign/{type}/{id}:
 *   delete:
 *     summary: Remove an assignment
 *     tags:
 *       - GymOwner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '204': { description: No Content }
 */
router.delete('/assign/:type/:id', gymOwnerController.removeAssignment.bind(gymOwnerController));

module.exports = router;
