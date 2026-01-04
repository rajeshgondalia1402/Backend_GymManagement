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

export default router;
