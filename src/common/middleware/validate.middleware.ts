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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email format'),
  subscriptionPlanId: z.string().uuid('Invalid subscription plan ID'),
  ownerId: z.string().uuid('Invalid owner ID').optional(),
});

export const updateGymSchema = createGymSchema.partial();

export const createGymOwnerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
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
  membershipStartDate: z.string().datetime().optional(),
  membershipEndDate: z.string().datetime().optional(),
});

export const updateMemberSchema = createMemberSchema.partial().omit({ password: true });

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
