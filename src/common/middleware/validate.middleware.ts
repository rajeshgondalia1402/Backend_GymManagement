import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const gymIdParamSchema = z.object({
  gymId: z.string().uuid('Invalid gym ID format'),
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

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
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  isActive: z.boolean().optional(),
});

// Gym Owner validation schemas
export const createTrainerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  specialization: z.string().optional(),
});

export const updateTrainerSchema = createTrainerSchema.partial().omit({ password: true });

export const createMemberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  trainerId: z.string().uuid('Invalid trainer ID').optional(),
  memberType: z.enum(['REGULAR', 'PT']).optional().default('REGULAR'),
  membershipStartDate: z.string().datetime().optional(),
  membershipEndDate: z.string().datetime().optional(),
});

export const updateMemberSchema = createMemberSchema.partial().omit({ password: true });

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

export const createExercisePlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number(),
    reps: z.number(),
    restTime: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
  durationMinutes: z.number().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
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

// Course Package validation schemas
export const createCoursePackageSchema = z.object({
  packageName: z.string().min(2, 'Package name must be at least 2 characters'),
  description: z.string().optional(),
  fees: z.number().positive('Fees must be positive'),
  maxDiscount: z.number().min(0, 'Max discount must be non-negative').optional(),
  discountType: z.enum(['PERCENTAGE', 'AMOUNT']).optional(),
});

export const updateCoursePackageSchema = createCoursePackageSchema.partial().extend({
  isActive: z.boolean().optional(),
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
