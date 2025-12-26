const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All routes require authentication and MEMBER role
router.use(authenticate, authorize('MEMBER'));

// Dashboard
/**
 * @openapi
 * /api/member/dashboard:
 *   get:
 *     summary: Member dashboard
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Dashboard data
 */
router.get('/dashboard', memberController.getDashboard.bind(memberController));

// Profile
/**
 * @openapi
 * /api/member/profile:
 *   get:
 *     summary: Get authenticated member profile
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Member profile returned
 *       '401':
 *         description: Unauthorized
 */
router.get('/profile', memberController.getProfile.bind(memberController));

// Assigned Trainer
/**
 * @openapi
 * /api/member/trainer:
 *   get:
 *     summary: Get assigned trainer
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Assigned trainer info
 */
router.get('/trainer', memberController.getAssignedTrainer.bind(memberController));

// Diet Plan
/**
 * @openapi
 * /api/member/diet-plan:
 *   get:
 *     summary: Get member's diet plan
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Diet plan
 */
router.get('/diet-plan', memberController.getDietPlan.bind(memberController));

// Exercise Plans
/**
 * @openapi
 * /api/member/exercise-plans:
 *   get:
 *     summary: Get exercise plans for member
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Exercise plans list
 */
router.get('/exercise-plans', memberController.getExercisePlans.bind(memberController));

/**
 * @openapi
 * /api/member/exercise-plans/today:
 *   get:
 *     summary: Get today's exercises
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Exercises for today
 */
router.get('/exercise-plans/today', memberController.getTodayExercise.bind(memberController));

// Membership Status
/**
 * @openapi
 * /api/member/membership:
 *   get:
 *     summary: Get membership status
 *     tags:
 *       - Member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Membership status
 */
router.get('/membership', memberController.getMembershipStatus.bind(memberController));

module.exports = router;
