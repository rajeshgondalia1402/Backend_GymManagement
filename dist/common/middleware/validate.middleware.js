"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.updateProfileSchema = exports.assignPlanSchema = exports.updateExercisePlanSchema = exports.createExercisePlanSchema = exports.updateDietPlanSchema = exports.createDietPlanSchema = exports.updateMemberSchema = exports.createMemberSchema = exports.updateTrainerSchema = exports.createTrainerSchema = exports.createGymOwnerSchema = exports.updateGymSchema = exports.createGymSchema = exports.updateSubscriptionPlanSchema = exports.createSubscriptionPlanSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.gymIdParamSchema = exports.idParamSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => parseInt(val || '1', 10)),
    limit: zod_1.z.string().optional().transform((val) => parseInt(val || '10', 10)),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid ID format'),
});
exports.gymIdParamSchema = zod_1.z.object({
    gymId: zod_1.z.string().uuid('Invalid gym ID format'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6, 'Current password is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
exports.createSubscriptionPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive('Price must be positive'),
    currency: zod_1.z.string().default('INR'),
    durationDays: zod_1.z.number().int().positive('Duration must be positive'),
    maxMembers: zod_1.z.number().int().positive('Max members must be positive'),
    maxTrainers: zod_1.z.number().int().positive('Max trainers must be positive'),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateSubscriptionPlanSchema = exports.createSubscriptionPlanSchema.partial();
exports.createGymSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    address: zod_1.z.string().min(5, 'Address must be at least 5 characters'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    subscriptionPlanId: zod_1.z.string().uuid('Invalid subscription plan ID'),
    ownerId: zod_1.z.string().uuid('Invalid owner ID').optional(),
});
exports.updateGymSchema = exports.createGymSchema.partial();
exports.createGymOwnerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters'),
});
exports.createTrainerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters'),
    specialization: zod_1.z.string().optional(),
});
exports.updateTrainerSchema = exports.createTrainerSchema.partial().omit({ password: true });
exports.createMemberSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters'),
    trainerId: zod_1.z.string().uuid('Invalid trainer ID').optional(),
    membershipStartDate: zod_1.z.string().datetime().optional(),
    membershipEndDate: zod_1.z.string().datetime().optional(),
});
exports.updateMemberSchema = exports.createMemberSchema.partial().omit({ password: true });
exports.createDietPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    meals: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        time: zod_1.z.string(),
        items: zod_1.z.array(zod_1.z.string()),
        calories: zod_1.z.number().optional(),
    })).optional(),
    totalCalories: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateDietPlanSchema = exports.createDietPlanSchema.partial();
exports.createExercisePlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    exercises: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        sets: zod_1.z.number(),
        reps: zod_1.z.number(),
        restTime: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional(),
    })).optional(),
    durationMinutes: zod_1.z.number().optional(),
    difficulty: zod_1.z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateExercisePlanSchema = exports.createExercisePlanSchema.partial();
exports.assignPlanSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid('Invalid member ID'),
    planId: zod_1.z.string().uuid('Invalid plan ID'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().min(10).optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    height: zod_1.z.number().positive().optional(),
    weight: zod_1.z.number().positive().optional(),
    fitnessGoal: zod_1.z.string().optional(),
});
const validate = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const data = await schema.parseAsync(req[source]);
            req[source] = data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map