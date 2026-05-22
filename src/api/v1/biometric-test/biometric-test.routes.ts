import { Router } from 'express';
import biometricTestController from './biometric-test.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BiometricTest
 *   description: Biometric test API
 */

/**
 * @swagger
 * /api/v1/biometric-test/insert:
 *   get:
 *     summary: Insert a biometric test record by passing id as query param
 *     tags: [BiometricTest]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The member ID to insert
 *         example: "abc123"
 *     responses:
 *       201:
 *         description: Biometric test record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Biometric test record created
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     memberId:
 *                       type: string
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing id query param
 */
router.get('/insert', (req, res, next) =>
  biometricTestController.insert(req, res, next)
);

/**
 * @swagger
 * /api/v1/biometric-test:
 *   get:
 *     summary: Get all biometric test records ordered by createdDate descending
 *     tags: [BiometricTest]
 *     responses:
 *       200:
 *         description: List of biometric test records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Biometric test records retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       memberId:
 *                         type: string
 *                       createdDate:
 *                         type: string
 *                         format: date-time
 */
router.get('/', (req, res, next) =>
  biometricTestController.getAll(req, res, next)
);

export default router;
