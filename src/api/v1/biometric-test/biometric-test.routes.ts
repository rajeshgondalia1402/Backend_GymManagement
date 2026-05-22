import { Router } from 'express';
import { z } from 'zod';
import biometricTestController from './biometric-test.controller';
import { validate } from '../../../common/middleware';

const router = Router();

const createSchema = z.object({
  memberId: z.string().uuid('memberId must be a valid UUID'),
});

/**
 * @swagger
 * tags:
 *   name: BiometricTest
 *   description: Biometric test API
 */

/**
 * @swagger
 * /api/v1/biometric-test:
 *   post:
 *     summary: Create a biometric test record for a member
 *     tags: [BiometricTest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the member
 *                 example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
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
 *                       format: uuid
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid memberId or member not found
 *       422:
 *         description: Validation error
 */
router.post('/', validate(createSchema), (req, res, next) =>
  biometricTestController.create(req, res, next)
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
 *                         format: uuid
 *                       createdDate:
 *                         type: string
 *                         format: date-time
 */
router.get('/', (req, res, next) =>
  biometricTestController.getAll(req, res, next)
);

export default router;
