const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');

// Public routes
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful — returns token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post('/login', validate(schemas.login), authController.login);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using a refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Token refreshed
 */
router.post('/refresh-token', validate(schemas.refreshToken), authController.refreshToken);

// Protected routes
// Protected routes

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logged out
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @openapi
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all sessions
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logged out from all sessions
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     summary: Change current user's password
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password changed
 *       '400':
 *         description: Bad request
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
