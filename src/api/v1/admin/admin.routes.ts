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
  updateGymOwnerSchema,
  createPlanCategorySchema,
  updatePlanCategorySchema,
  createOccupationSchema,
  updateOccupationSchema,
  createEnquiryTypeSchema,
  updateEnquiryTypeSchema,
  createPaymentTypeSchema,
  updatePaymentTypeSchema,
  idParamSchema,
  paginationSchema,
  uploadGymLogo,
  handleUploadError,
  renewGymSubscriptionSchema,
  gymSubscriptionHistoryQuerySchema,
  gymIdParamSchema,
  createGymInquirySchema,
  updateGymInquirySchema,
  createGymInquiryFollowupSchema,
  gymInquiryPaginationSchema,
  adminMembersQuerySchema,
  createExpenseGroupSchema,
  updateExpenseGroupSchema,
  createExpenseSchema,
  updateExpenseSchema,
  expenseReportSchema,
  uploadExpenseAttachments,
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
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Gym Name
 *               address1:
 *                 type: string
 *                 description: Address Line 1
 *               address2:
 *                 type: string
 *                 description: Address Line 2
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State
 *               zipcode:
 *                 type: string
 *                 description: Zipcode (only numbers allowed)
 *               mobileNo:
 *                 type: string
 *                 description: Mobile No (only numbers allowed)
 *               phoneNo:
 *                 type: string
 *                 description: Phone No (only numbers allowed)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email Id (with email validation)
 *               gstRegNo:
 *                 type: string
 *                 description: GST Reg. No
 *               website:
 *                 type: string
 *                 description: Website URL
 *               note:
 *                 type: string
 *                 description: Note (Terms and Conditions on Receipts)
 *               gymLogo:
 *                 type: string
 *                 description: Gym Logo path (use /gyms/{id}/upload-logo to upload)
 *               subscriptionPlanId:
 *                 type: string
 *                 format: uuid
 *                 description: Subscription Plan ID
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *                 description: Owner User ID
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Gym Name
 *               address1:
 *                 type: string
 *                 description: Address Line 1
 *               address2:
 *                 type: string
 *                 description: Address Line 2
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State
 *               zipcode:
 *                 type: string
 *                 description: Zipcode (only numbers allowed)
 *               mobileNo:
 *                 type: string
 *                 description: Mobile No (only numbers allowed)
 *               phoneNo:
 *                 type: string
 *                 description: Phone No (only numbers allowed)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email Id (with email validation)
 *               gstRegNo:
 *                 type: string
 *                 description: GST Reg. No
 *               website:
 *                 type: string
 *                 description: Website URL
 *               note:
 *                 type: string
 *                 description: Note (Terms and Conditions on Receipts)
 *               gymLogo:
 *                 type: string
 *                 description: Gym Logo path
 *               subscriptionPlanId:
 *                 type: string
 *                 format: uuid
 *                 description: Subscription Plan ID
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *                 description: Owner User ID
 *     responses:
 *       200:
 *         description: Gym updated successfully
 */
router.put('/gyms/:id', validate(idParamSchema, 'params'), validate(updateGymSchema), adminController.updateGym);

/**
 * @swagger
 * /api/v1/admin/gyms/{id}/upload-logo:
 *   post:
 *     summary: Upload gym logo
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               gymLogo:
 *                 type: string
 *                 format: binary
 *                 description: Gym logo image (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid file type or file too large
 *       404:
 *         description: Gym not found
 */
router.post('/gyms/:id/upload-logo', validate(idParamSchema, 'params'), uploadGymLogo, handleUploadError, adminController.uploadGymLogo);

/**
 * @swagger
 * /api/v1/admin/gyms/{id}/delete-logo:
 *   delete:
 *     summary: Delete gym logo
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *     responses:
 *       200:
 *         description: Logo deleted successfully
 *       404:
 *         description: Gym not found
 */
router.delete('/gyms/:id/delete-logo', validate(idParamSchema, 'params'), adminController.deleteGymLogo);

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

/**
 * @swagger
 * /api/v1/admin/gyms/{id}/assign-owner:
 *   patch:
 *     summary: Assign an owner to a gym
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerId
 *             properties:
 *               ownerId:
 *                 type: string
 *                 description: User ID of the gym owner
 *     responses:
 *       200:
 *         description: Owner assigned to gym successfully
 *       404:
 *         description: Gym or user not found
 *       400:
 *         description: User is not a gym owner or already owns a gym
 */
router.patch('/gyms/:id/assign-owner', validate(idParamSchema, 'params'), adminController.assignGymOwner);

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
 * /api/v1/admin/gym-owners/{id}:
 *   get:
 *     summary: Get gym owner by ID
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
 *         description: Gym owner retrieved successfully
 *       404:
 *         description: Gym owner not found
 */
router.get('/gym-owners/:id', validate(idParamSchema, 'params'), adminController.getGymOwnerById);

/**
 * @swagger
 * /api/v1/admin/gym-owners/{id}:
 *   put:
 *     summary: Update a gym owner
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name
 *               firstName:
 *                 type: string
 *                 description: First name
 *               lastName:
 *                 type: string
 *                 description: Last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Gym owner updated successfully
 *       404:
 *         description: Gym owner not found
 */
router.put('/gym-owners/:id', validate(idParamSchema, 'params'), validate(updateGymOwnerSchema), adminController.updateGymOwner);

/**
 * @swagger
 * /api/v1/admin/gym-owners/{id}:
 *   delete:
 *     summary: Delete a gym owner
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
 *         description: Gym owner deleted successfully
 *       404:
 *         description: Gym owner not found
 */
router.delete('/gym-owners/:id', validate(idParamSchema, 'params'), adminController.deleteGymOwner);

/**
 * @swagger
 * /api/v1/admin/gym-owners/{id}/reset-password:
 *   post:
 *     summary: Reset gym owner password
 *     description: |
 *       Generates a new temporary password for the gym owner.
 *       The admin should securely share this password with the gym owner.
 *       The gym owner should change this password on their next login.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym Owner ID
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ownerId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     temporaryPassword:
 *                       type: string
 *                       description: The new temporary password - share securely with gym owner
 *                     message:
 *                       type: string
 *       404:
 *         description: Gym owner not found
 */
router.post('/gym-owners/:id/reset-password', validate(idParamSchema, 'params'), adminController.resetGymOwnerPassword);

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

// Occupation Master CRUD
/**
 * @swagger
 * /api/v1/admin/occupations:
 *   get:
 *     summary: Get all occupations
 *     tags: [Admin - Occupations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Occupations retrieved successfully
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
 *                     $ref: '#/components/schemas/Occupation'
 */
router.get('/occupations', adminController.getOccupations);

/**
 * @swagger
 * /api/v1/admin/occupations/{id}:
 *   get:
 *     summary: Get occupation by ID
 *     tags: [Admin - Occupations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Occupation ID
 *     responses:
 *       200:
 *         description: Occupation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Occupation'
 *       404:
 *         description: Occupation not found
 */
router.get('/occupations/:id', validate(idParamSchema, 'params'), adminController.getOccupationById);

/**
 * @swagger
 * /api/v1/admin/occupations:
 *   post:
 *     summary: Create a new occupation
 *     tags: [Admin - Occupations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - occupationName
 *             properties:
 *               occupationName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the occupation (unique)
 *               description:
 *                 type: string
 *                 description: Description of the occupation
 *     responses:
 *       201:
 *         description: Occupation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Occupation'
 *       409:
 *         description: Occupation with this name already exists
 */
router.post('/occupations', validate(createOccupationSchema), adminController.createOccupation);

/**
 * @swagger
 * /api/v1/admin/occupations/{id}:
 *   put:
 *     summary: Update an occupation
 *     tags: [Admin - Occupations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Occupation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               occupationName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the occupation (unique)
 *               description:
 *                 type: string
 *                 description: Description of the occupation
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Occupation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Occupation'
 *       404:
 *         description: Occupation not found
 *       409:
 *         description: Occupation with this name already exists
 */
router.put('/occupations/:id', validate(idParamSchema, 'params'), validate(updateOccupationSchema), adminController.updateOccupation);

/**
 * @swagger
 * /api/v1/admin/occupations/{id}:
 *   delete:
 *     summary: Delete an occupation (soft delete - sets isActive to false)
 *     tags: [Admin - Occupations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Occupation ID
 *     responses:
 *       200:
 *         description: Occupation deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Occupation'
 *       404:
 *         description: Occupation not found
 */
router.delete('/occupations/:id', validate(idParamSchema, 'params'), adminController.deleteOccupation);

/**
 * @swagger
 * /api/v1/admin/occupations/{id}/usage:
 *   get:
 *     summary: Check occupation usage
 *     tags: [Admin - Occupations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Occupation ID
 *     responses:
 *       200:
 *         description: Usage info retrieved successfully
 *       404:
 *         description: Occupation not found
 */
router.get('/occupations/:id/usage', validate(idParamSchema, 'params'), adminController.getOccupationUsage);

// Plan Category Master CRUD
/**
 * @swagger
 * /api/v1/admin/plan-categories:
 *   get:
 *     summary: Get all plan categories
 *     tags: [Admin - Plan Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plan categories retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 */
router.get('/plan-categories', adminController.getPlanCategories);

/**
 * @swagger
 * /api/v1/admin/plan-categories/{id}:
 *   get:
 *     summary: Get plan category by ID
 *     tags: [Admin - Plan Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Plan Category ID
 *     responses:
 *       200:
 *         description: Plan category retrieved successfully
 *       404:
 *         description: Plan category not found
 */
router.get('/plan-categories/:id', validate(idParamSchema, 'params'), adminController.getPlanCategoryById);

/**
 * @swagger
 * /api/v1/admin/plan-categories:
 *   post:
 *     summary: Create a new plan category
 *     tags: [Admin - Plan Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plan category created successfully
 *       409:
 *         description: Plan category with this name already exists
 */
router.post('/plan-categories', validate(createPlanCategorySchema), adminController.createPlanCategory);

/**
 * @swagger
 * /api/v1/admin/plan-categories/{id}:
 *   put:
 *     summary: Update a plan category
 *     tags: [Admin - Plan Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Plan Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan category updated successfully
 *       404:
 *         description: Plan category not found
 *       409:
 *         description: Plan category with this name already exists
 */
router.put('/plan-categories/:id', validate(idParamSchema, 'params'), validate(updatePlanCategorySchema), adminController.updatePlanCategory);

/**
 * @swagger
 * /api/v1/admin/plan-categories/{id}:
 *   delete:
 *     summary: Delete a plan category (soft delete)
 *     tags: [Admin - Plan Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Plan Category ID
 *     responses:
 *       200:
 *         description: Plan category deleted successfully
 *       404:
 *         description: Plan category not found
 *       409:
 *         description: Cannot delete - plan category is in use
 */
router.delete('/plan-categories/:id', validate(idParamSchema, 'params'), adminController.deletePlanCategory);

/**
 * @swagger
 * /api/v1/admin/plan-categories/{id}/usage:
 *   get:
 *     summary: Check plan category usage
 *     tags: [Admin - Plan Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Plan Category ID
 *     responses:
 *       200:
 *         description: Usage info retrieved successfully
 *       404:
 *         description: Plan category not found
 */
router.get('/plan-categories/:id/usage', validate(idParamSchema, 'params'), adminController.getPlanCategoryUsage);

// Enquiry Type Master CRUD
/**
 * @swagger
 * /api/v1/admin/enquiry-types:
 *   get:
 *     summary: Get all enquiry types
 *     tags: [Admin - Enquiry Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enquiry types retrieved successfully
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
 *                     $ref: '#/components/schemas/EnquiryType'
 */
router.get('/enquiry-types', adminController.getEnquiryTypes);

/**
 * @swagger
 * /api/v1/admin/enquiry-types/{id}:
 *   get:
 *     summary: Get enquiry type by ID
 *     tags: [Admin - Enquiry Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enquiry Type ID
 *     responses:
 *       200:
 *         description: Enquiry type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnquiryType'
 *       404:
 *         description: Enquiry type not found
 */
router.get('/enquiry-types/:id', validate(idParamSchema, 'params'), adminController.getEnquiryTypeById);

/**
 * @swagger
 * /api/v1/admin/enquiry-types:
 *   post:
 *     summary: Create a new enquiry type
 *     tags: [Admin - Enquiry Types]
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the enquiry type (unique)
 *     responses:
 *       201:
 *         description: Enquiry type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnquiryType'
 *       409:
 *         description: Enquiry type with this name already exists
 */
router.post('/enquiry-types', validate(createEnquiryTypeSchema), adminController.createEnquiryType);

/**
 * @swagger
 * /api/v1/admin/enquiry-types/{id}:
 *   put:
 *     summary: Update an enquiry type
 *     tags: [Admin - Enquiry Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enquiry Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the enquiry type (unique)
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Enquiry type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnquiryType'
 *       404:
 *         description: Enquiry type not found
 *       409:
 *         description: Enquiry type with this name already exists
 */
router.put('/enquiry-types/:id', validate(idParamSchema, 'params'), validate(updateEnquiryTypeSchema), adminController.updateEnquiryType);

/**
 * @swagger
 * /api/v1/admin/enquiry-types/{id}:
 *   delete:
 *     summary: Delete an enquiry type (soft delete - sets isActive to false)
 *     tags: [Admin - Enquiry Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enquiry Type ID
 *     responses:
 *       200:
 *         description: Enquiry type deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnquiryType'
 *       404:
 *         description: Enquiry type not found
 */
router.delete('/enquiry-types/:id', validate(idParamSchema, 'params'), adminController.deleteEnquiryType);

/**
 * @swagger
 * /api/v1/admin/enquiry-types/{id}/usage:
 *   get:
 *     summary: Check enquiry type usage
 *     tags: [Admin - Enquiry Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enquiry type ID
 *     responses:
 *       200:
 *         description: Usage info retrieved successfully
 *       404:
 *         description: Enquiry type not found
 */
router.get('/enquiry-types/:id/usage', validate(idParamSchema, 'params'), adminController.getEnquiryTypeUsage);

// Payment Type Master CRUD
/**
 * @swagger
 * /api/v1/admin/payment-types:
 *   get:
 *     summary: Get all payment types
 *     tags: [Admin - Payment Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment types retrieved successfully
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
 *                     $ref: '#/components/schemas/PaymentType'
 */
router.get('/payment-types', adminController.getPaymentTypes);

/**
 * @swagger
 * /api/v1/admin/payment-types/{id}:
 *   get:
 *     summary: Get payment type by ID
 *     tags: [Admin - Payment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment Type ID
 *     responses:
 *       200:
 *         description: Payment type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentType'
 *       404:
 *         description: Payment type not found
 */
router.get('/payment-types/:id', validate(idParamSchema, 'params'), adminController.getPaymentTypeById);

/**
 * @swagger
 * /api/v1/admin/payment-types:
 *   post:
 *     summary: Create a new payment type
 *     tags: [Admin - Payment Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentTypeName
 *             properties:
 *               paymentTypeName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the payment type (unique)
 *               description:
 *                 type: string
 *                 description: Description of the payment type
 *     responses:
 *       201:
 *         description: Payment type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentType'
 *       409:
 *         description: Payment type with this name already exists
 */
router.post('/payment-types', validate(createPaymentTypeSchema), adminController.createPaymentType);

/**
 * @swagger
 * /api/v1/admin/payment-types/{id}:
 *   put:
 *     summary: Update a payment type
 *     tags: [Admin - Payment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentTypeName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the payment type (unique)
 *               description:
 *                 type: string
 *                 description: Description of the payment type
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Payment type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentType'
 *       404:
 *         description: Payment type not found
 *       409:
 *         description: Payment type with this name already exists
 */
router.put('/payment-types/:id', validate(idParamSchema, 'params'), validate(updatePaymentTypeSchema), adminController.updatePaymentType);

/**
 * @swagger
 * /api/v1/admin/payment-types/{id}:
 *   delete:
 *     summary: Delete a payment type (soft delete - sets isActive to false)
 *     tags: [Admin - Payment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment Type ID
 *     responses:
 *       200:
 *         description: Payment type deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentType'
 *       404:
 *         description: Payment type not found
 */
router.delete('/payment-types/:id', validate(idParamSchema, 'params'), adminController.deletePaymentType);

/**
 * @swagger
 * /api/v1/admin/payment-types/{id}/usage:
 *   get:
 *     summary: Check payment type usage
 *     tags: [Admin - Payment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment type ID
 *     responses:
 *       200:
 *         description: Usage info retrieved successfully
 *       404:
 *         description: Payment type not found
 */
router.get('/payment-types/:id/usage', validate(idParamSchema, 'params'), adminController.getPaymentTypeUsage);

// Gym Subscription History
/**
 * @swagger
 * /api/v1/admin/gyms/{gymId}/renew-subscription:
 *   post:
 *     summary: Renew gym subscription (same or different plan)
 *     tags: [Admin - Gym Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gymId
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
 *             required:
 *               - subscriptionPlanId
 *             properties:
 *               subscriptionPlanId:
 *                 type: string
 *                 format: uuid
 *               subscriptionStart:
 *                 type: string
 *                 format: date-time
 *               paymentMode:
 *                 type: string
 *               paidAmount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gym subscription renewed successfully
 */
router.post('/gyms/:gymId/renew-subscription', validate(gymIdParamSchema, 'params'), validate(renewGymSubscriptionSchema), adminController.renewGymSubscription);

/**
 * @swagger
 * /api/v1/admin/gyms/{gymId}/subscription-history:
 *   get:
 *     summary: Get gym subscription history (paginated)
 *     tags: [Admin - Gym Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gymId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription history retrieved successfully
 */
router.get('/gyms/:gymId/subscription-history', validate(gymIdParamSchema, 'params'), validate(gymSubscriptionHistoryQuerySchema, 'query'), adminController.getGymSubscriptionHistory);

/**
 * @swagger
 * /api/v1/admin/subscription-history/{id}:
 *   get:
 *     summary: Get specific subscription history record
 *     tags: [Admin - Gym Subscription]
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
 *         description: Subscription history record retrieved successfully
 */
router.get('/subscription-history/:id', validate(idParamSchema, 'params'), adminController.getGymSubscriptionHistoryById);

// Gym Inquiries
router.get('/gym-inquiries', validate(gymInquiryPaginationSchema, 'query'), adminController.getGymInquiries);
router.get('/gym-inquiries/:id', validate(idParamSchema, 'params'), adminController.getGymInquiryById);
router.post('/gym-inquiries', validate(createGymInquirySchema), adminController.createGymInquiry);
router.put('/gym-inquiries/:id', validate(idParamSchema, 'params'), validate(updateGymInquirySchema), adminController.updateGymInquiry);
router.patch('/gym-inquiries/:id/toggle-status', validate(idParamSchema, 'params'), adminController.toggleGymInquiryStatus);
router.get('/gym-inquiries/:id/followups', validate(idParamSchema, 'params'), adminController.getGymInquiryFollowups);
router.post('/gym-inquiries/:id/followups', validate(idParamSchema, 'params'), validate(createGymInquiryFollowupSchema), adminController.createGymInquiryFollowup);

// Admin Members List by Gym/GymOwner
/**
 * @swagger
 * /api/v1/admin/members:
 *   get:
 *     summary: Get all members for a specific gym or gym owner
 *     description: |
 *       Lists all members with comprehensive details including subscription info,
 *       payment summary, assigned trainer, diet plan, and PT details.
 *       Either gymId or gymOwnerId must be provided.
 *     tags: [Admin - Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gymId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gym ID (either gymId or gymOwnerId required)
 *       - in: query
 *         name: gymOwnerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gym Owner ID (either gymId or gymOwnerId required)
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by member name, email, phone, or member ID
 *       - in: query
 *         name: membershipStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, CANCELLED]
 *         description: Filter by membership status
 *       - in: query
 *         name: memberType
 *         schema:
 *           type: string
 *           enum: [REGULAR, PT, REGULAR_PT]
 *         description: Filter by member type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
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
 *         description: Members retrieved successfully
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           memberId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           memberType:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                               passwordHint:
 *                                 type: string
 *                           subscription:
 *                             type: object
 *                             properties:
 *                               membershipStart:
 *                                 type: string
 *                                 format: date-time
 *                               membershipEnd:
 *                                 type: string
 *                                 format: date-time
 *                               membershipStatus:
 *                                 type: string
 *                               daysRemaining:
 *                                 type: integer
 *                           package:
 *                             type: object
 *                             properties:
 *                               coursePackageName:
 *                                 type: string
 *                               packageFees:
 *                                 type: number
 *                               finalFees:
 *                                 type: number
 *                           payment:
 *                             type: object
 *                             properties:
 *                               totalAmount:
 *                                 type: number
 *                               totalPaid:
 *                                 type: number
 *                               totalPending:
 *                                 type: number
 *                               paymentStatus:
 *                                 type: string
 *                           trainer:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               name:
 *                                 type: string
 *                               specialization:
 *                                 type: string
 *                           dietPlan:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               templateName:
 *                                 type: string
 *                               meals:
 *                                 type: array
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Either gymId or gymOwnerId is required
 *       404:
 *         description: Gym not found
 */
router.get('/members', validate(adminMembersQuerySchema, 'query'), adminController.getMembersByGymOrOwner);

// =============================================
// Admin Expense Group Master CRUD
// =============================================

/**
 * @swagger
 * /api/v1/admin/expense-groups:
 *   get:
 *     summary: Get all admin expense groups
 *     tags: [Admin - Expense Groups]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       expenseGroupName:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/expense-groups', adminController.getAdminExpenseGroups);

/**
 * @swagger
 * /api/v1/admin/expense-groups/{id}:
 *   get:
 *     summary: Get admin expense group by ID
 *     tags: [Admin - Expense Groups]
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
 *       404:
 *         description: Expense group not found
 */
router.get('/expense-groups/:id', validate(idParamSchema, 'params'), adminController.getAdminExpenseGroupById);

/**
 * @swagger
 * /api/v1/admin/expense-groups:
 *   post:
 *     summary: Create a new admin expense group
 *     tags: [Admin - Expense Groups]
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
 *     responses:
 *       201:
 *         description: Expense group created successfully
 *       409:
 *         description: Expense group with this name already exists
 */
router.post('/expense-groups', validate(createExpenseGroupSchema), adminController.createAdminExpenseGroup);

/**
 * @swagger
 * /api/v1/admin/expense-groups/{id}:
 *   put:
 *     summary: Update an admin expense group
 *     tags: [Admin - Expense Groups]
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
 *             required:
 *               - expenseGroupName
 *             properties:
 *               expenseGroupName:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       200:
 *         description: Expense group updated successfully
 *       404:
 *         description: Expense group not found
 *       409:
 *         description: Expense group with this name already exists
 */
router.put('/expense-groups/:id', validate(idParamSchema, 'params'), validate(updateExpenseGroupSchema), adminController.updateAdminExpenseGroup);

/**
 * @swagger
 * /api/v1/admin/expense-groups/{id}:
 *   delete:
 *     summary: Delete an admin expense group (hard delete)
 *     tags: [Admin - Expense Groups]
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
 *         description: Expense group deleted successfully
 *       404:
 *         description: Expense group not found
 */
router.delete('/expense-groups/:id', validate(idParamSchema, 'params'), adminController.deleteAdminExpenseGroup);

// =============================================
// Admin Expense Management CRUD
// =============================================

/**
 * @swagger
 * /api/v1/admin/expenses:
 *   get:
 *     summary: Get admin expenses with filters (Report API)
 *     tags: [Admin - Expenses]
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
 *         description: Filter by year
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter to date
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
 */
router.get('/expenses', validate(expenseReportSchema, 'query'), adminController.getAdminExpenses);

/**
 * @swagger
 * /api/v1/admin/expenses/{id}:
 *   get:
 *     summary: Get admin expense by ID
 *     tags: [Admin - Expenses]
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
router.get('/expenses/:id', validate(idParamSchema, 'params'), adminController.getAdminExpenseById);

/**
 * @swagger
 * /api/v1/admin/expenses:
 *   post:
 *     summary: Create a new admin expense
 *     tags: [Admin - Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       404:
 *         description: Expense group not found
 */
router.post('/expenses', uploadExpenseAttachments, handleUploadError, validate(createExpenseSchema), adminController.createAdminExpense);

/**
 * @swagger
 * /api/v1/admin/expenses/{id}:
 *   put:
 *     summary: Update an admin expense
 *     tags: [Admin - Expenses]
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
 *         multipart/form-data:
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
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
router.put('/expenses/:id', uploadExpenseAttachments, handleUploadError, validate(idParamSchema, 'params'), validate(updateExpenseSchema), adminController.updateAdminExpense);

/**
 * @swagger
 * /api/v1/admin/expenses/{id}:
 *   delete:
 *     summary: Soft delete an admin expense
 *     tags: [Admin - Expenses]
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
router.delete('/expenses/:id', validate(idParamSchema, 'params'), adminController.deleteAdminExpense);

// =============================================
// Admin Dashboard V2 - Counts + Detail Report APIs
// =============================================

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/counts:
 *   get:
 *     summary: Get admin dashboard counts (all cards)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard counts retrieved successfully
 */
router.get('/dashboard-v2/counts', adminController.getAdminDashboardCounts);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/active-gyms:
 *   get:
 *     summary: List all active gyms (detail report for Total Active Gyms card)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Active gyms list retrieved successfully
 */
router.get('/dashboard-v2/active-gyms', adminController.getActiveGymsDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/active-gym-inquiries:
 *   get:
 *     summary: List all active gym inquiries (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Active gym inquiries list retrieved successfully
 */
router.get('/dashboard-v2/active-gym-inquiries', adminController.getActiveGymInquiriesDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/todays-followup-inquiries:
 *   get:
 *     summary: List todays followup gym inquiries (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Todays followup inquiries list retrieved successfully
 */
router.get('/dashboard-v2/todays-followup-inquiries', adminController.getTodaysFollowupInquiriesDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/expiring-gyms:
 *   get:
 *     summary: List gyms expiring within 2 days (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Expiring gyms list retrieved successfully
 */
router.get('/dashboard-v2/expiring-gyms', adminController.getTwoDaysLeftExpiringGymsDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/expired-gyms:
 *   get:
 *     summary: List all expired gyms (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Expired gyms list retrieved successfully
 */
router.get('/dashboard-v2/expired-gyms', adminController.getExpiredGymsDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/renewal-gyms:
 *   get:
 *     summary: List all renewal gym subscription history (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Renewal gyms list retrieved successfully
 */
router.get('/dashboard-v2/renewal-gyms', adminController.getRenewalGymsDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/members:
 *   get:
 *     summary: List all members across all gyms (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Members list retrieved successfully
 */
router.get('/dashboard-v2/members', adminController.getMembersDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/popular-plan-gyms:
 *   get:
 *     summary: List gyms on the most popular subscription plan (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Popular plan gyms list retrieved successfully
 */
router.get('/dashboard-v2/popular-plan-gyms', adminController.getPopularPlanGymsDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/recent-gyms:
 *   get:
 *     summary: List recently registered gyms (last 7 days) (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Recent gyms list retrieved successfully
 */
router.get('/dashboard-v2/recent-gyms', adminController.getRecentGymsDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/total-income:
 *   get:
 *     summary: List all income records (detail report for Total Income card)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Total income details retrieved successfully
 */
router.get('/dashboard-v2/total-income', adminController.getTotalIncomeDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/total-expense:
 *   get:
 *     summary: List all expense records (detail report for Total Expense card)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Total expense details retrieved successfully
 */
router.get('/dashboard-v2/total-expense', adminController.getTotalExpenseDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/this-month-income:
 *   get:
 *     summary: List this months income records (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: This months income details retrieved successfully
 */
router.get('/dashboard-v2/this-month-income', adminController.getThisMonthIncomeDetail);

/**
 * @swagger
 * /api/v1/admin/dashboard-v2/this-month-expense:
 *   get:
 *     summary: List this months expense records (detail report)
 *     tags: [Admin - Dashboard V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: This months expense details retrieved successfully
 */
router.get('/dashboard-v2/this-month-expense', adminController.getThisMonthExpenseDetail);

// =============================================
// File Download - Presigned URLs
// =============================================

/**
 * @swagger
 * /api/v1/admin/files/presigned-url:
 *   post:
 *     summary: Get presigned download URL for a file
 *     tags: [Admin - Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               expiresIn:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 */
router.post('/files/presigned-url', adminController.getPresignedUrl);

/**
 * @swagger
 * /api/v1/admin/files/presigned-urls:
 *   post:
 *     summary: Get presigned download URLs for multiple files
 *     tags: [Admin - Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - urls
 *             properties:
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresIn:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Presigned URLs generated successfully
 */
router.post('/files/presigned-urls', adminController.getPresignedUrls);

export default router;
