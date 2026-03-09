import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Gym subscription status filter
  subscriptionStatus: z.enum(['ACTIVE', 'EXPIRED', 'EXPIRING_SOON']).optional(),
  // Member-specific filters
  status: z.enum(['Active', 'InActive', 'Expired']).optional(),
  isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  memberType: z.enum(['REGULAR', 'PT', 'REGULAR_PT']).optional(),
  hasPTAddon: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  smsFacility: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  // Date range filters
  membershipStartFrom: z.string().optional(),
  membershipStartTo: z.string().optional(),
  membershipEndFrom: z.string().optional(),
  membershipEndTo: z.string().optional(),
  // Course package filter
  coursePackageId: z.string().uuid().optional(),
  // Payment filter
  paymentFor: z.enum(['REGULAR', 'PT']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const gymIdParamSchema = z.object({
  gymId: z.string().uuid('Invalid gym ID format'),
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().optional(),
  mobileNo: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(
  (data) => data.email || data.mobileNo,
  { message: 'Either email or mobile number is required', path: ['email'] }
);

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Admin validation schemas
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('INR'),
  durationDays: z.number().int().positive('Duration must be positive'),
  features: z.string().optional(), // Changed from array to string to support HTML
  isActive: z.boolean().optional().default(true),
});

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

export const createGymSchema = z.object({
  name: z.string().min(2, 'Gym Name must be at least 2 characters'),
  address1: z.string().min(5, 'Address 1 must be at least 5 characters').optional(),
  address2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  state: z.string().min(2, 'State must be at least 2 characters').optional(),
  zipcode: z.string()
    .regex(/^\d+$/, 'Zipcode must contain only numbers')
    .max(10, 'Zipcode must be at most 10 digits')
    .optional(),
  mobileNo: z.string()
    .regex(/^\d+$/, 'Mobile No must contain only numbers')
    .min(10, 'Mobile No must be at least 10 digits')
    .max(15, 'Mobile No must be at most 15 digits')
    .optional(),
  phoneNo: z.string()
    .regex(/^\d+$/, 'Phone No must contain only numbers')
    .min(10, 'Phone No must be at least 10 digits')
    .max(15, 'Phone No must be at most 15 digits')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  gstRegNo: z.string().max(20, 'GST Reg. No must be at most 20 characters').optional(),
  website: z.string().optional(),
  note: z.string().optional(),
  gymLogo: z.string().optional(),
  subscriptionPlanId: z.string().uuid('Invalid subscription plan ID').optional(),
  ownerId: z.string().uuid('Invalid owner ID').optional(),
});

export const updateGymSchema = createGymSchema.partial();

// Plan Category Master validation schemas
export const createPlanCategorySchema = z.object({
  categoryName: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updatePlanCategorySchema = createPlanCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Occupation Master validation schemas
export const createOccupationSchema = z.object({
  occupationName: z.string().min(2, 'Occupation name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateOccupationSchema = createOccupationSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Enquiry Type Master validation schemas
export const createEnquiryTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const updateEnquiryTypeSchema = createEnquiryTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Payment Type Master validation schemas
export const createPaymentTypeSchema = z.object({
  paymentTypeName: z.string().min(2, 'Payment type name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updatePaymentTypeSchema = createPaymentTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Expense Group Master validation schemas
export const createExpenseGroupSchema = z.object({
  expenseGroupName: z.string().min(2, 'Expense group name must be at least 2 characters'),
});

export const updateExpenseGroupSchema = z.object({
  expenseGroupName: z.string().min(2, 'Expense group name must be at least 2 characters'),
});

// Expense Management validation schemas
export const createExpenseSchema = z.object({
  expenseDate: z.string().datetime().optional(),
  name: z.string().min(2, 'Expense name must be at least 2 characters'),
  expenseGroupId: z.string().uuid('Invalid expense group ID'),
  description: z.string().optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid payment mode' }),
  }),
  amount: z.union([
    z.number().positive('Amount must be positive'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error('Amount must be a positive number');
      return num;
    })
  ]),
});

export const updateExpenseSchema = z.object({
  expenseDate: z.string().datetime().optional(),
  name: z.string().min(2, 'Expense name must be at least 2 characters').optional(),
  expenseGroupId: z.string().uuid('Invalid expense group ID').optional(),
  description: z.string().optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid payment mode' }),
  }).optional(),
  amount: z.union([
    z.number().positive('Amount must be positive'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error('Amount must be a positive number');
      return num;
    })
  ]).optional(),
  isActive: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
});

export const expenseReportSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('expenseDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Filters
  year: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  expenseGroupId: z.string().uuid('Invalid expense group ID').optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER']).optional(),
});

// Designation Master validation schemas
export const createDesignationSchema = z.object({
  designationName: z.string().min(2, 'Designation name must be at least 2 characters'),
});

export const updateDesignationSchema = z.object({
  designationName: z.string().min(2, 'Designation name must be at least 2 characters'),
});

// Body Part Master validation schemas
export const createBodyPartSchema = z.object({
  bodyPartName: z.string().min(2, 'Body part name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateBodyPartSchema = z.object({
  bodyPartName: z.string().min(2, 'Body part name must be at least 2 characters').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Workout Exercise Master validation schemas
export const createWorkoutExerciseSchema = z.object({
  bodyPartId: z.string().uuid('Invalid body part ID'),
  exerciseName: z.string().min(2, 'Exercise name must be at least 2 characters'),
  shortCode: z.string().max(20, 'Short code must be at most 20 characters').optional(),
  description: z.string().optional(),
});

export const updateWorkoutExerciseSchema = z.object({
  bodyPartId: z.string().uuid('Invalid body part ID').optional(),
  exerciseName: z.string().min(2, 'Exercise name must be at least 2 characters').optional(),
  shortCode: z.string().max(20, 'Short code must be at most 20 characters').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createGymOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
}).refine(
  (data) => data.name || (data.firstName && data.lastName),
  { message: 'Either name or both firstName and lastName are required', path: ['name'] }
);

export const updateGymOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  isActive: z.boolean().optional(),
});

// Gym Owner validation schemas
export const createTrainerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  specialization: z.string().optional(),
  experience: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]).optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  idProofType: z.string().optional(),
});

export const updateTrainerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  specialization: z.string().optional(),
  experience: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]).optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  idProofType: z.string().optional(),
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
});


export const createMemberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  altContactNo: z.string().min(10, 'Alternate contact must be at least 10 characters').optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  bloodGroup: z.string().optional(),
  dateOfBirth: z.string().optional(),
  anniversaryDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  healthNotes: z.string().optional(),
  idProofType: z.string().optional(),
  smsFacility: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  trainerId: z.string().uuid('Invalid trainer ID').optional(),
  memberType: z.enum(['REGULAR', 'PT', 'REGULAR_PT']).optional().default('REGULAR'),
  membershipStartDate: z.string().optional(),
  membershipEndDate: z.string().optional(),
  // Fee-related fields
  coursePackageId: z.string().uuid('Invalid course package ID').optional(),
  packageFees: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  maxDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  afterDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  extraDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  finalFees: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  // PT Addon Fields (for REGULAR_PT type)
  hasPTAddon: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  ptPackageName: z.string().optional(),
  ptTrainerId: z.string().uuid('Invalid PT trainer ID').optional(),
  ptSessionsTotal: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]).optional(),
  ptSessionDuration: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]).optional(),
  ptPackageFees: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  ptMaxDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  ptExtraDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  ptFinalFees: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  ptStartDate: z.string().optional(),
  ptEndDate: z.string().optional(),
  ptGoals: z.string().optional(),
  ptNotes: z.string().optional(),
});

export const updateMemberSchema = createMemberSchema.partial().omit({ password: true }).extend({
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
});

// PT Member validation schemas
export const createPTMemberSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  trainerId: z.string().uuid('Invalid trainer ID'),
  packageName: z.string().min(2, 'Package name must be at least 2 characters'),
  sessionsTotal: z.number().int().positive('Sessions must be positive'),
  sessionDuration: z.number().int().positive().optional().default(60),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  goals: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePTMemberSchema = z.object({
  trainerId: z.string().uuid('Invalid trainer ID').optional(),
  packageName: z.string().min(2).optional(),
  sessionsTotal: z.number().int().positive().optional(),
  sessionsUsed: z.number().int().min(0).optional(),
  sessionDuration: z.number().int().positive().optional(),
  endDate: z.string().datetime().optional(),
  goals: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Supplement validation schemas
export const createSupplementSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  timing: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateSupplementSchema = createSupplementSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Member Diet Plan validation schemas
export const createMemberDietPlanSchema = z.object({
  planName: z.string().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().optional(),
  calories: z.number().int().positive().optional(),
  meals: z.any(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateMemberDietPlanSchema = createMemberDietPlanSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Inquiry validation schemas
export const createInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  source: z.enum(['WALK_IN', 'PHONE', 'WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER']).optional().default('WALK_IN'),
  interest: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
});

export const updateInquirySchema = createInquirySchema.partial().extend({
  status: z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'FOLLOW_UP']).optional(),
});

// Member ID param schema
export const memberIdParamSchema = z.object({
  memberId: z.string().uuid('Invalid member ID format'),
});

export const ptMemberIdParamSchema = z.object({
  ptMemberId: z.string().uuid('Invalid PT member ID format'),
});

export const createDietPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  meals: z.array(z.object({
    name: z.string(),
    time: z.string(),
    items: z.array(z.string()),
    calories: z.number().optional(),
  })).optional(),
  totalCalories: z.number().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateDietPlanSchema = createDietPlanSchema.partial();

// Exercise item schema (reusable)
const exerciseItemSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.number(),
  restTime: z.number().optional(),
  notes: z.string().optional(),
});

// Daily exercises schema (object with day keys)
const dailyExercisesSchema = z.object({
  monday: z.array(exerciseItemSchema).optional(),
  tuesday: z.array(exerciseItemSchema).optional(),
  wednesday: z.array(exerciseItemSchema).optional(),
  thursday: z.array(exerciseItemSchema).optional(),
  friday: z.array(exerciseItemSchema).optional(),
  saturday: z.array(exerciseItemSchema).optional(),
  sunday: z.array(exerciseItemSchema).optional(),
});

export const createExercisePlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.string().optional(),
  // Exercises can be either an array (general plan) or object with day keys (daily plan)
  exercises: z.union([
    z.array(exerciseItemSchema),
    dailyExercisesSchema
  ]).optional(),
  durationMinutes: z.number().optional(),
  difficulty: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateExercisePlanSchema = createExercisePlanSchema.partial();

export const assignPlanSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  planId: z.string().uuid('Invalid plan ID'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Member validation schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  dateOfBirth: z.string().datetime().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  fitnessGoal: z.string().optional(),
});

// Member Inquiry validation schemas
export const createMemberInquirySchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  contactNo: z.string().min(10, 'Contact number must be at least 10 characters'),
  inquiryDate: z.string().datetime().optional(),
  dob: z.string().datetime().optional(),
  followUp: z.boolean().optional().default(false),
  followUpDate: z.string().datetime().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  address: z.string().optional(),
  heardAbout: z.string().optional(),
  comments: z.string().optional(),
  memberPhoto: z.string().optional(),
  height: z.any().optional(),
  weight: z.any().optional(),
  referenceName: z.string().optional(),
});

export const updateMemberInquirySchema = createMemberInquirySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

// Course Package validation schemas - helper for months field
const monthsFieldSchema = z.union([
  z.number().int().positive('Months must be greater than 0'),
  z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error('Months must be greater than 0');
    }
    return parsed;
  })
]);

export const createCoursePackageSchema = z.object({
  packageName: z.string().min(2, 'Package name must be at least 2 characters'),
  description: z.string().optional(),
  fees: z.number().positive('Fees must be positive'),
  maxDiscount: z.number().min(0, 'Max discount must be non-negative').optional(),
  discountType: z.enum(['PERCENTAGE', 'AMOUNT']).optional(),
  coursePackageType: z.enum(['REGULAR', 'PT']).optional().default('REGULAR'),
  Months: monthsFieldSchema.optional(),
  months: monthsFieldSchema.optional(),
}).transform((data) => {
  // Normalize months/Months field - prefer lowercase 'months' if both provided
  const monthsValue = data.months ?? data.Months;
  const { months, ...rest } = data;
  return { ...rest, Months: monthsValue };
}).refine((data) => data.Months !== undefined, {
  message: 'Months is required',
  path: ['Months'],
});

export const updateCoursePackageSchema = z.object({
  packageName: z.string().min(2, 'Package name must be at least 2 characters').optional(),
  description: z.string().optional(),
  fees: z.number().positive('Fees must be positive').optional(),
  maxDiscount: z.number().min(0, 'Max discount must be non-negative').optional(),
  discountType: z.enum(['PERCENTAGE', 'AMOUNT']).optional(),
  coursePackageType: z.enum(['REGULAR', 'PT']).optional(),
  Months: monthsFieldSchema.optional(),
  months: monthsFieldSchema.optional(),
  isActive: z.boolean().optional(),
}).transform((data) => {
  // Normalize months/Months field - prefer lowercase 'months' if both provided
  const monthsValue = data.months ?? data.Months;
  const { months, ...rest } = data;
  return { ...rest, Months: monthsValue };
});

// Member Balance Payment validation schemas
export const createMemberBalancePaymentSchema = z.object({
  paymentFor: z.enum(['REGULAR', 'PT']).optional().default('REGULAR'),
  paymentDate: z.string().optional(),
  paidFees: z.union([z.number().positive('Paid fees must be positive'), z.string().transform(val => parseFloat(val))]),
  payMode: z.string().min(1, 'Payment mode is required'),
  nextPaymentDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateMemberBalancePaymentSchema = createMemberBalancePaymentSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// PT Addon validation schemas
export const addPTAddonSchema = z.object({
  ptPackageName: z.string().min(2, 'PT package name is required'),
  trainerId: z.string().uuid('Invalid trainer ID'),
  ptPackageFees: z.union([z.number().positive('PT fees must be positive'), z.string().transform(val => parseFloat(val))]),
  ptMaxDiscount: z.union([z.number().min(0), z.string().transform(val => parseFloat(val))]).optional(),
  ptExtraDiscount: z.union([z.number().min(0), z.string().transform(val => parseFloat(val))]).optional(),
  ptFinalFees: z.union([z.number().positive('Final PT fees is required'), z.string().transform(val => parseFloat(val))]),
  initialPayment: z.union([z.number().min(0), z.string().transform(val => parseFloat(val))]).optional(),
  paymentMode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goals: z.string().optional(),
  notes: z.string().optional(),
});

// Remove PT Addon validation schema
export const removePTAddonSchema = z.object({
  action: z.enum(['COMPLETE', 'FORFEIT', 'CARRY_FORWARD']),
  notes: z.string().optional(),
});

// Update PT Addon validation schema (all fields optional for partial updates)
export const updatePTAddonSchema = z.object({
  ptPackageName: z.string().min(2, 'PT package name is required').optional(),
  trainerId: z.string().uuid('Invalid trainer ID').optional(),
  ptPackageFees: z.union([z.number().positive('PT fees must be positive'), z.string().transform(val => parseFloat(val))]).optional(),
  ptMaxDiscount: z.union([z.number().min(0), z.string().transform(val => parseFloat(val))]).optional(),
  ptExtraDiscount: z.union([z.number().min(0), z.string().transform(val => parseFloat(val))]).optional(),
  ptFinalFees: z.union([z.number().positive('Final PT fees is required'), z.string().transform(val => parseFloat(val))]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goals: z.string().optional(),
  notes: z.string().optional(),
});

// Membership Renewal validation schemas
export const createMembershipRenewalSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),

  // New membership dates (required)
  newMembershipStart: z.string().min(1, 'New membership start date is required'),
  newMembershipEnd: z.string().min(1, 'New membership end date is required'),

  // Renewal type
  renewalType: z.enum(['STANDARD', 'EARLY', 'LATE', 'UPGRADE', 'DOWNGRADE']).optional(),

  // Package and fees
  coursePackageId: z.string().uuid('Invalid course package ID').optional(),
  packageFees: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  maxDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  afterDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  extraDiscount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),
  finalFees: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),

  // Payment info
  paymentMode: z.string().optional(),
  paidAmount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),

  notes: z.string().optional(),
});

export const updateMembershipRenewalSchema = z.object({
  // Payment info (most common update)
  paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional(),
  paymentMode: z.string().optional(),
  paidAmount: z.union([z.number(), z.string().transform(val => parseFloat(val))]).optional(),

  // Can also update notes
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Renewal pagination with additional filters
export const renewalPaginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('renewalDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Renewal-specific filters
  renewalType: z.enum(['STANDARD', 'EARLY', 'LATE', 'UPGRADE', 'DOWNGRADE']).optional(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional(),
  // Date range filters
  renewalDateFrom: z.string().optional(),
  renewalDateTo: z.string().optional(),
});

// Diet Template List/Search Pagination Schema
export const dietTemplatePaginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(), // Search in template name, meal titles, meal descriptions
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Filter by meals per day (number of meals)
  mealsPerDay: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  // Filter by active status
  isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
});

// ============================================
// Diet Template Validation Schemas
// ============================================

// Diet Meal schema - for 6 meals per day
// Supports both frontend naming (mealNumber, mealTitle, mealTime) and backend naming (mealNo, title, time)
const dietMealSchema = z.object({
  mealNo: z.number().int().min(1).max(6, 'Meal number must be between 1 and 6').optional(),
  mealNumber: z.number().int().min(1).max(6, 'Meal number must be between 1 and 6').optional(),
  title: z.string().min(2, 'Meal title must be at least 2 characters').optional(),
  mealTitle: z.string().min(2, 'Meal title must be at least 2 characters').optional(),
  description: z.string().min(1, 'Meal description is required'),
  time: z.string().optional(),
  mealTime: z.string().optional(),
}).transform((data) => ({
  mealNo: data.mealNo ?? data.mealNumber,
  title: data.title ?? data.mealTitle,
  description: data.description,
  time: data.time ?? data.mealTime,
})).refine(
  (data) => data.mealNo !== undefined,
  { message: 'mealNo or mealNumber is required', path: ['mealNo'] }
).refine(
  (data) => data.title !== undefined,
  { message: 'title or mealTitle is required', path: ['title'] }
).refine(
  (data) => data.time !== undefined,
  { message: 'time or mealTime is required', path: ['time'] }
);

// Create Diet Template schema
// Supports both frontend naming (templateName) and backend naming (name)
export const createDietTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters').optional(),
  templateName: z.string().min(2, 'Template name must be at least 2 characters').optional(),
  description: z.string().optional(),
  mealsPerDay: z.number().int().min(1).max(6).optional(),
  meals: z.array(dietMealSchema)
    .min(1, 'At least one meal is required')
    .max(6, 'Maximum 6 meals allowed'),
}).transform((data) => ({
  name: data.name ?? data.templateName,
  description: data.description,
  meals: data.meals,
})).refine(
  (data) => data.name !== undefined,
  { message: 'name or templateName is required', path: ['name'] }
).refine(
  (data) => {
    const mealNos = data.meals.map(m => m.mealNo);
    return new Set(mealNos).size === mealNos.length;
  },
  { message: 'Meal numbers must be unique', path: ['meals'] }
);

// Update Diet Template schema
export const updateDietTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters').optional(),
  templateName: z.string().min(2, 'Template name must be at least 2 characters').optional(),
  description: z.string().optional(),
  mealsPerDay: z.number().int().min(1).max(6).optional(),
  meals: z.array(dietMealSchema)
    .min(1, 'At least one meal is required')
    .max(6, 'Maximum 6 meals allowed')
    .optional(),
}).transform((data) => ({
  name: data.name ?? data.templateName,
  description: data.description,
  meals: data.meals,
})).refine(
  (data) => {
    if (data.meals) {
      const mealNos = data.meals.map(m => m.mealNo);
      return new Set(mealNos).size === mealNos.length;
    }
    return true;
  },
  { message: 'Meal numbers must be unique', path: ['meals'] }
);

// Toggle Diet Template Active Status schema
// Accepts isActive boolean or empty body (will toggle current status)
export const toggleDietTemplateActiveSchema = z.object({
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  status: z.union([z.boolean(), z.string().transform(val => val === 'true' || val === 'active')]).optional(),
}).transform((data) => ({
  isActive: data.isActive ?? data.status,
}));

// ============================================
// Member Diet Validation Schemas
// ============================================

// Member Diet Meal schema - for customized meals per member
// Supports both frontend naming (mealNumber, mealTitle, mealTime) and backend naming (mealNo, title, time)
const memberDietMealSchema = z.object({
  mealNo: z.number().int().min(1).max(6, 'Meal number must be between 1 and 6').optional(),
  mealNumber: z.number().int().min(1).max(6, 'Meal number must be between 1 and 6').optional(),
  title: z.string().min(2, 'Meal title must be at least 2 characters').optional(),
  mealTitle: z.string().min(2, 'Meal title must be at least 2 characters').optional(),
  description: z.string().min(1, 'Meal description is required'),
  time: z.string().optional(),
  mealTime: z.string().optional(),
}).transform((data) => ({
  mealNo: data.mealNo ?? data.mealNumber,
  title: data.title ?? data.mealTitle,
  description: data.description,
  time: data.time ?? data.mealTime,
})).refine(
  (data) => data.mealNo !== undefined,
  { message: 'mealNo or mealNumber is required', path: ['mealNo'] }
).refine(
  (data) => data.title !== undefined,
  { message: 'title or mealTitle is required', path: ['title'] }
).refine(
  (data) => data.time !== undefined,
  { message: 'time or mealTime is required', path: ['time'] }
);

// Create Member Diet schema (assign diet to multiple members)
export const createMemberDietSchema = z.object({
  memberIds: z.array(z.string().uuid('Invalid member ID')).min(1, 'At least one member ID is required'),
  dietTemplateId: z.string().uuid('Invalid diet template ID'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  // Optional: Allow customizing meals during assignment
  customMeals: z.array(memberDietMealSchema)
    .max(6, 'Maximum 6 meals allowed')
    .refine(
      (meals) => {
        const mealNos = meals.map(m => m.mealNo);
        return new Set(mealNos).size === mealNos.length;
      },
      { message: 'Meal numbers must be unique' }
    )
    .optional(),
});

// Update Member Diet schema
export const updateMemberDietSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  // Allow updating individual meals
  meals: z.array(memberDietMealSchema)
    .max(6, 'Maximum 6 meals allowed')
    .refine(
      (meals) => {
        const mealNos = meals.map(m => m.mealNo);
        return new Set(mealNos).size === mealNos.length;
      },
      { message: 'Meal numbers must be unique' }
    )
    .optional(),
});

// Deactivate Member Diet schema
export const deactivateMemberDietSchema = z.object({
  reason: z.string().optional(),
});

// Remove Assigned Members schema (bulk delete member diets)
export const removeAssignedMembersSchema = z.object({
  memberDietIds: z.array(z.string().uuid('Invalid member diet ID')).min(1, 'At least one member diet ID is required'),
});

// Member UUID param schema
export const memberUuidParamSchema = z.object({
  memberUuid: z.string().uuid('Invalid member UUID format'),
});

// =============================================
// Trainer Salary Settlement Validation Schemas
// =============================================

// Incentive type enum
const incentiveTypeEnum = z.enum(['PT', 'PROTEIN', 'MEMBER_REFERENCE', 'OTHERS']);

// Salary month format validation (YYYY-MM)
const salaryMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

// Salary calculation schema
export const salaryCalculationSchema = z.object({
  trainerId: z.string().uuid('Invalid trainer ID'),
  salaryMonth: z.string().regex(salaryMonthRegex, 'Salary month must be in YYYY-MM format'),
  presentDays: z.union([
    z.number().int().min(0, 'Present days cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) throw new Error('Present days must be a non-negative integer');
      return num;
    }),
  ]),
  discountDays: z.union([
    z.number().int().min(0, 'Discount days cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) throw new Error('Discount days must be a non-negative integer');
      return num;
    }),
  ]).optional().default(0),
  incentiveAmount: z.union([
    z.number().min(0, 'Incentive amount cannot be negative'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) throw new Error('Incentive amount must be a non-negative number');
      return num;
    }),
  ]).optional().default(0),
  incentiveType: incentiveTypeEnum.optional(),
});

// Create salary settlement schema
export const createSalarySettlementSchema = z.object({
  trainerId: z.string().uuid('Invalid trainer ID'),
  salaryMonth: z.string().regex(salaryMonthRegex, 'Salary month must be in YYYY-MM format'),
  salarySentDate: z.string().optional(),
  presentDays: z.union([
    z.number().int().min(0, 'Present days cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) throw new Error('Present days must be a non-negative integer');
      return num;
    }),
  ]),
  discountDays: z.union([
    z.number().int().min(0, 'Discount days cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) throw new Error('Discount days must be a non-negative integer');
      return num;
    }),
  ]).optional().default(0),
  incentiveAmount: z.union([
    z.number().min(0, 'Incentive amount cannot be negative'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) throw new Error('Incentive amount must be a non-negative number');
      return num;
    }),
  ]).optional().default(0),
  incentiveType: incentiveTypeEnum.optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid payment mode' }),
  }),
  remarks: z.string().optional(),
});

// Update salary settlement schema
export const updateSalarySettlementSchema = z.object({
  salarySentDate: z.string().optional(),
  presentDays: z.union([
    z.number().int().min(0, 'Present days cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) throw new Error('Present days must be a non-negative integer');
      return num;
    }),
  ]).optional(),
  discountDays: z.union([
    z.number().int().min(0, 'Discount days cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) throw new Error('Discount days must be a non-negative integer');
      return num;
    }),
  ]).optional(),
  incentiveAmount: z.union([
    z.number().min(0, 'Incentive amount cannot be negative'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) throw new Error('Incentive amount must be a non-negative number');
      return num;
    }),
  ]).optional(),
  incentiveType: incentiveTypeEnum.optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid payment mode' }),
  }).optional(),
  remarks: z.string().optional(),
});

// Salary settlement pagination/filter schema
export const salarySettlementPaginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Filters
  trainerId: z.string().uuid().optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// Gym Subscription Renewal validation schemas
export const renewGymSubscriptionSchema = z.object({
  subscriptionPlanId: z.string().uuid('Invalid subscription plan ID'),
  subscriptionStart: z.string().optional(),
  paymentMode: z.string().optional(),
  paidAmount: z.union([z.number().min(0, 'Paid amount must be non-negative'), z.string().transform(val => parseFloat(val))]).optional(),
  notes: z.string().optional(),
});

export const gymSubscriptionHistoryQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('renewalDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional(),
  renewalType: z.enum(['NEW', 'RENEWAL', 'UPGRADE', 'DOWNGRADE']).optional(),
});

// Gym Inquiry validation schemas
export const createGymInquirySchema = z.object({
  gymName: z.string().min(2, 'Gym name must be at least 2 characters'),
  address1: z.string().optional(),
  address2: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  mobileNo: z.string().regex(/^\d+$/, 'Only numbers allowed').min(10).max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  subscriptionPlanId: z.string().uuid('Invalid subscription plan ID'),
  note: z.string().optional(),
  sellerName: z.string().optional(),
  sellerMobileNo: z.string().regex(/^\d+$/, 'Only numbers').min(10).max(15).optional().or(z.literal('')),
  nextFollowupDate: z.string().optional(),
  memberSize: z.number().int().positive().optional(),
  enquiryTypeId: z.string().uuid('Invalid enquiry type ID'),
});

export const updateGymInquirySchema = createGymInquirySchema.partial();

export const createGymInquiryFollowupSchema = z.object({
  followupDate: z.string().optional(),
  note: z.string().optional(),
});

export const gymInquiryPaginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  subscriptionPlanId: z.string().uuid().optional(),
  isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
});

// Admin Members List validation schema
export const adminMembersQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  gymId: z.string().uuid('Invalid gym ID').optional(),
  gymOwnerId: z.string().uuid('Invalid gym owner ID').optional(),
  membershipStatus: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
  memberType: z.enum(['REGULAR', 'PT', 'REGULAR_PT']).optional(),
  isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
}).refine(
  (data) => data.gymId || data.gymOwnerId,
  { message: 'Either gymId or gymOwnerId is required', path: ['gymId'] }
);

// =============================================
// Report Validation Schemas
// =============================================

// Expense Report query schema (Combined Expenses + Salary Settlements)
export const expenseReportQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Date filters
  year: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  month: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    if (num < 1 || num > 12) throw new Error('Month must be between 1 and 12');
    return num;
  }),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  // Type filter
  expenseType: z.enum(['EXPENSE', 'SALARY']).optional(),
  expenseGroupId: z.string().uuid('Invalid expense group ID').optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'NET_BANKING', 'OTHER']).optional(),
});

// Income Report query schema (Members with Total Payments)
export const incomeReportQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('totalPaidAmount'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Date filters
  year: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  month: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    if (num < 1 || num > 12) throw new Error('Month must be between 1 and 12');
    return num;
  }),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  // Additional filters
  paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional(),
  membershipStatus: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
});

// Member Payment Details query schema (for popup)
export const memberPaymentDetailsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  paymentFor: z.enum(['REGULAR', 'PT']).optional(),
});

// Validation middleware factory
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await schema.parseAsync(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
