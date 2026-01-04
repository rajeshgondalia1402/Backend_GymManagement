"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.updateProfileSchema = exports.assignPlanSchema = exports.updateExercisePlanSchema = exports.createExercisePlanSchema = exports.updateDietPlanSchema = exports.createDietPlanSchema = exports.ptMemberIdParamSchema = exports.memberIdParamSchema = exports.updateInquirySchema = exports.createInquirySchema = exports.updateMemberDietPlanSchema = exports.createMemberDietPlanSchema = exports.updateSupplementSchema = exports.createSupplementSchema = exports.updatePTMemberSchema = exports.createPTMemberSchema = exports.updateMemberSchema = exports.createMemberSchema = exports.updateTrainerSchema = exports.createTrainerSchema = exports.createGymOwnerSchema = exports.updateWorkoutExerciseSchema = exports.createWorkoutExerciseSchema = exports.updateDesignationSchema = exports.createDesignationSchema = exports.updateExpenseGroupSchema = exports.createExpenseGroupSchema = exports.updatePaymentTypeSchema = exports.createPaymentTypeSchema = exports.updateEnquiryTypeSchema = exports.createEnquiryTypeSchema = exports.updateOccupationSchema = exports.createOccupationSchema = exports.updateGymSchema = exports.createGymSchema = exports.updateSubscriptionPlanSchema = exports.createSubscriptionPlanSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.gymIdParamSchema = exports.idParamSchema = exports.paginationSchema = void 0;
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
    features: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateSubscriptionPlanSchema = exports.createSubscriptionPlanSchema.partial();
exports.createGymSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Gym Name must be at least 2 characters'),
    address1: zod_1.z.string().min(5, 'Address 1 must be at least 5 characters').optional(),
    address2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2, 'City must be at least 2 characters').optional(),
    state: zod_1.z.string().min(2, 'State must be at least 2 characters').optional(),
    zipcode: zod_1.z.string()
        .regex(/^\d+$/, 'Zipcode must contain only numbers')
        .max(10, 'Zipcode must be at most 10 digits')
        .optional(),
    mobileNo: zod_1.z.string()
        .regex(/^\d+$/, 'Mobile No must contain only numbers')
        .min(10, 'Mobile No must be at least 10 digits')
        .max(15, 'Mobile No must be at most 15 digits')
        .optional(),
    phoneNo: zod_1.z.string()
        .regex(/^\d+$/, 'Phone No must contain only numbers')
        .min(10, 'Phone No must be at least 10 digits')
        .max(15, 'Phone No must be at most 15 digits')
        .optional(),
    email: zod_1.z.string().email('Invalid email format').optional(),
    gstRegNo: zod_1.z.string().max(20, 'GST Reg. No must be at most 20 characters').optional(),
    website: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
    gymLogo: zod_1.z.string().optional(),
    subscriptionPlanId: zod_1.z.string().uuid('Invalid subscription plan ID').optional(),
    ownerId: zod_1.z.string().uuid('Invalid owner ID').optional(),
});
exports.updateGymSchema = exports.createGymSchema.partial();
exports.createOccupationSchema = zod_1.z.object({
    occupationName: zod_1.z.string().min(2, 'Occupation name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
});
exports.updateOccupationSchema = exports.createOccupationSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createEnquiryTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
});
exports.updateEnquiryTypeSchema = exports.createEnquiryTypeSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createPaymentTypeSchema = zod_1.z.object({
    paymentTypeName: zod_1.z.string().min(2, 'Payment type name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
});
exports.updatePaymentTypeSchema = exports.createPaymentTypeSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createExpenseGroupSchema = zod_1.z.object({
    expenseGroupName: zod_1.z.string().min(2, 'Expense group name must be at least 2 characters'),
});
exports.updateExpenseGroupSchema = zod_1.z.object({
    expenseGroupName: zod_1.z.string().min(2, 'Expense group name must be at least 2 characters'),
});
exports.createDesignationSchema = zod_1.z.object({
    designationName: zod_1.z.string().min(2, 'Designation name must be at least 2 characters'),
});
exports.updateDesignationSchema = zod_1.z.object({
    designationName: zod_1.z.string().min(2, 'Designation name must be at least 2 characters'),
});
exports.createWorkoutExerciseSchema = zod_1.z.object({
    exerciseName: zod_1.z.string().min(2, 'Exercise name must be at least 2 characters'),
    shortCode: zod_1.z.string().max(20, 'Short code must be at most 20 characters').optional(),
    description: zod_1.z.string().optional(),
});
exports.updateWorkoutExerciseSchema = zod_1.z.object({
    exerciseName: zod_1.z.string().min(2, 'Exercise name must be at least 2 characters').optional(),
    shortCode: zod_1.z.string().max(20, 'Short code must be at most 20 characters').optional(),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createGymOwnerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters').optional(),
}).refine((data) => data.name || (data.firstName && data.lastName), { message: 'Either name or both firstName and lastName are required', path: ['name'] });
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
    memberType: zod_1.z.enum(['REGULAR', 'PT']).optional().default('REGULAR'),
    membershipStartDate: zod_1.z.string().datetime().optional(),
    membershipEndDate: zod_1.z.string().datetime().optional(),
});
exports.updateMemberSchema = exports.createMemberSchema.partial().omit({ password: true });
exports.createPTMemberSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid('Invalid member ID'),
    trainerId: zod_1.z.string().uuid('Invalid trainer ID'),
    packageName: zod_1.z.string().min(2, 'Package name must be at least 2 characters'),
    sessionsTotal: zod_1.z.number().int().positive('Sessions must be positive'),
    sessionDuration: zod_1.z.number().int().positive().optional().default(60),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    goals: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updatePTMemberSchema = zod_1.z.object({
    trainerId: zod_1.z.string().uuid('Invalid trainer ID').optional(),
    packageName: zod_1.z.string().min(2).optional(),
    sessionsTotal: zod_1.z.number().int().positive().optional(),
    sessionsUsed: zod_1.z.number().int().min(0).optional(),
    sessionDuration: zod_1.z.number().int().positive().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    goals: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createSupplementSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    dosage: zod_1.z.string().optional(),
    frequency: zod_1.z.string().optional(),
    timing: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateSupplementSchema = exports.createSupplementSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createMemberDietPlanSchema = zod_1.z.object({
    planName: zod_1.z.string().min(2, 'Plan name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    calories: zod_1.z.number().int().positive().optional(),
    meals: zod_1.z.any(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateMemberDietPlanSchema = exports.createMemberDietPlanSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createInquirySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters'),
    source: zod_1.z.enum(['WALK_IN', 'PHONE', 'WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER']).optional().default('WALK_IN'),
    interest: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    followUpDate: zod_1.z.string().datetime().optional(),
});
exports.updateInquirySchema = exports.createInquirySchema.partial().extend({
    status: zod_1.z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'FOLLOW_UP']).optional(),
});
exports.memberIdParamSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid('Invalid member ID format'),
});
exports.ptMemberIdParamSchema = zod_1.z.object({
    ptMemberId: zod_1.z.string().uuid('Invalid PT member ID format'),
});
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