const { z } = require('zod');
const { errorResponse } = require('../utils/response.utils');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.slice(1).join('.'),
          message: e.message
        }));
        return errorResponse(res, 'Validation failed', 400, errors);
      }
      next(error);
    }
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required')
    })
  }),

  // User schemas
  createUser: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      role: z.enum(['ADMIN', 'GYM_OWNER', 'MEMBER']).optional()
    })
  }),

  // Gym schemas
  createGym: z.object({
    body: z.object({
      name: z.string().min(2, 'Gym name must be at least 2 characters'),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      ownerId: z.string().uuid().optional(),
      subscriptionPlanId: z.string().uuid().optional()
    })
  }),

  // Subscription plan schemas
  createSubscriptionPlan: z.object({
    body: z.object({
      name: z.string().min(2, 'Plan name must be at least 2 characters'),
      description: z.string().optional(),
      price: z.number().positive('Price must be positive'),
      durationDays: z.number().int().positive('Duration must be positive'),
      features: z.array(z.string()).optional()
    })
  }),

  // Member schemas
  createMember: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      phone: z.string().optional(),
      dateOfBirth: z.string().datetime().optional(),
      gender: z.string().optional(),
      address: z.string().optional(),
      membershipEnd: z.string().datetime('Invalid date format')
    })
  }),

  // Trainer schemas
  createTrainer: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      phone: z.string().optional(),
      specialization: z.string().optional(),
      experience: z.number().int().optional()
    })
  }),

  // Diet plan schemas
  createDietPlan: z.object({
    body: z.object({
      name: z.string().min(2, 'Plan name must be at least 2 characters'),
      description: z.string().optional(),
      calories: z.number().int().positive().optional(),
      meals: z.any() // JSON object
    })
  }),

  // Exercise plan schemas
  createExercisePlan: z.object({
    body: z.object({
      name: z.string().min(2, 'Plan name must be at least 2 characters'),
      description: z.string().optional(),
      type: z.enum(['daily', 'weekly']).optional(),
      exercises: z.any() // JSON object
    })
  }),

  // Assignment schemas
  assignTrainer: z.object({
    body: z.object({
      memberId: z.string().uuid('Invalid member ID'),
      trainerId: z.string().uuid('Invalid trainer ID')
    })
  }),

  assignDietPlan: z.object({
    body: z.object({
      memberId: z.string().uuid('Invalid member ID'),
      dietPlanId: z.string().uuid('Invalid diet plan ID'),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })
  }),

  assignExercisePlan: z.object({
    body: z.object({
      memberId: z.string().uuid('Invalid member ID'),
      exercisePlanId: z.string().uuid('Invalid exercise plan ID'),
      dayOfWeek: z.number().int().min(0).max(6).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })
  }),

  // UUID param validation
  uuidParam: z.object({
    params: z.object({
      id: z.string().uuid('Invalid ID format')
    })
  })
};

module.exports = { validate, schemas };
