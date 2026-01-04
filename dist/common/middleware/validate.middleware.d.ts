import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const gymIdParamSchema: z.ZodObject<{
    gymId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    gymId: string;
}, {
    gymId: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const createSubscriptionPlanSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    durationDays: z.ZodNumber;
    features: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    price: number;
    durationDays: number;
    currency: string;
    description?: string | undefined;
    features?: string | undefined;
}, {
    name: string;
    price: number;
    durationDays: number;
    isActive?: boolean | undefined;
    description?: string | undefined;
    features?: string | undefined;
    currency?: string | undefined;
}>;
export declare const updateSubscriptionPlanSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    durationDays: z.ZodOptional<z.ZodNumber>;
    features: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    price?: number | undefined;
    durationDays?: number | undefined;
    features?: string | undefined;
    currency?: string | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    price?: number | undefined;
    durationDays?: number | undefined;
    features?: string | undefined;
    currency?: string | undefined;
}>;
export declare const createGymSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    subscriptionPlanId: z.ZodString;
    ownerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    address: string;
    phone: string;
    subscriptionPlanId: string;
    ownerId?: string | undefined;
}, {
    name: string;
    email: string;
    address: string;
    phone: string;
    subscriptionPlanId: string;
    ownerId?: string | undefined;
}>;
export declare const updateGymSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    subscriptionPlanId: z.ZodOptional<z.ZodString>;
    ownerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    ownerId?: string | undefined;
    subscriptionPlanId?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    ownerId?: string | undefined;
    subscriptionPlanId?: string | undefined;
}>;
export declare const createOccupationSchema: z.ZodObject<{
    occupationName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    occupationName: string;
    description?: string | undefined;
}, {
    occupationName: string;
    description?: string | undefined;
}>;
export declare const updateOccupationSchema: z.ZodObject<{
    occupationName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    occupationName?: string | undefined;
}, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    occupationName?: string | undefined;
}>;
export declare const createEnquiryTypeSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const updateEnquiryTypeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const createPaymentTypeSchema: z.ZodObject<{
    paymentTypeName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paymentTypeName: string;
    description?: string | undefined;
}, {
    paymentTypeName: string;
    description?: string | undefined;
}>;
export declare const updatePaymentTypeSchema: z.ZodObject<{
    paymentTypeName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    paymentTypeName?: string | undefined;
}, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    paymentTypeName?: string | undefined;
}>;
export declare const createExpenseGroupSchema: z.ZodObject<{
    expenseGroupName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    expenseGroupName: string;
}, {
    expenseGroupName: string;
}>;
export declare const updateExpenseGroupSchema: z.ZodObject<{
    expenseGroupName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    expenseGroupName: string;
}, {
    expenseGroupName: string;
}>;
export declare const createDesignationSchema: z.ZodObject<{
    designationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    designationName: string;
}, {
    designationName: string;
}>;
export declare const updateDesignationSchema: z.ZodObject<{
    designationName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    designationName: string;
}, {
    designationName: string;
}>;
export declare const createGymOwnerSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>, {
    email: string;
    password: string;
    name?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const createTrainerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    specialization: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    specialization?: string | undefined;
}, {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    specialization?: string | undefined;
}>;
export declare const updateTrainerSchema: z.ZodObject<Omit<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    specialization?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    specialization?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const createMemberSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    trainerId: z.ZodOptional<z.ZodString>;
    memberType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["REGULAR", "PT"]>>>;
    membershipStartDate: z.ZodOptional<z.ZodString>;
    membershipEndDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    phone: string;
    memberType: "REGULAR" | "PT";
    firstName: string;
    lastName: string;
    trainerId?: string | undefined;
    membershipStartDate?: string | undefined;
    membershipEndDate?: string | undefined;
}, {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    memberType?: "REGULAR" | "PT" | undefined;
    trainerId?: string | undefined;
    membershipStartDate?: string | undefined;
    membershipEndDate?: string | undefined;
}>;
export declare const updateMemberSchema: z.ZodObject<Omit<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    trainerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    memberType: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["REGULAR", "PT"]>>>>;
    membershipStartDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    membershipEndDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    memberType?: "REGULAR" | "PT" | undefined;
    trainerId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    membershipStartDate?: string | undefined;
    membershipEndDate?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    memberType?: "REGULAR" | "PT" | undefined;
    trainerId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    membershipStartDate?: string | undefined;
    membershipEndDate?: string | undefined;
}>;
export declare const createPTMemberSchema: z.ZodObject<{
    memberId: z.ZodString;
    trainerId: z.ZodString;
    packageName: z.ZodString;
    sessionsTotal: z.ZodNumber;
    sessionDuration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    goals: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    memberId: string;
    trainerId: string;
    packageName: string;
    sessionsTotal: number;
    sessionDuration: number;
    startDate?: string | undefined;
    endDate?: string | undefined;
    goals?: string | undefined;
    notes?: string | undefined;
}, {
    memberId: string;
    trainerId: string;
    packageName: string;
    sessionsTotal: number;
    startDate?: string | undefined;
    endDate?: string | undefined;
    sessionDuration?: number | undefined;
    goals?: string | undefined;
    notes?: string | undefined;
}>;
export declare const updatePTMemberSchema: z.ZodObject<{
    trainerId: z.ZodOptional<z.ZodString>;
    packageName: z.ZodOptional<z.ZodString>;
    sessionsTotal: z.ZodOptional<z.ZodNumber>;
    sessionsUsed: z.ZodOptional<z.ZodNumber>;
    sessionDuration: z.ZodOptional<z.ZodNumber>;
    endDate: z.ZodOptional<z.ZodString>;
    goals: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    endDate?: string | undefined;
    trainerId?: string | undefined;
    packageName?: string | undefined;
    sessionsTotal?: number | undefined;
    sessionsUsed?: number | undefined;
    sessionDuration?: number | undefined;
    goals?: string | undefined;
    notes?: string | undefined;
}, {
    isActive?: boolean | undefined;
    endDate?: string | undefined;
    trainerId?: string | undefined;
    packageName?: string | undefined;
    sessionsTotal?: number | undefined;
    sessionsUsed?: number | undefined;
    sessionDuration?: number | undefined;
    goals?: string | undefined;
    notes?: string | undefined;
}>;
export declare const createSupplementSchema: z.ZodObject<{
    name: z.ZodString;
    dosage: z.ZodOptional<z.ZodString>;
    frequency: z.ZodOptional<z.ZodString>;
    timing: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: string | undefined;
    dosage?: string | undefined;
    frequency?: string | undefined;
    timing?: string | undefined;
}, {
    name: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: string | undefined;
    dosage?: string | undefined;
    frequency?: string | undefined;
    timing?: string | undefined;
}>;
export declare const updateSupplementSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    dosage: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    frequency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    timing: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: string | undefined;
    dosage?: string | undefined;
    frequency?: string | undefined;
    timing?: string | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: string | undefined;
    dosage?: string | undefined;
    frequency?: string | undefined;
    timing?: string | undefined;
}>;
export declare const createMemberDietPlanSchema: z.ZodObject<{
    planName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    calories: z.ZodOptional<z.ZodNumber>;
    meals: z.ZodAny;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planName: string;
    description?: string | undefined;
    calories?: number | undefined;
    meals?: any;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    planName: string;
    description?: string | undefined;
    calories?: number | undefined;
    meals?: any;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const updateMemberDietPlanSchema: z.ZodObject<{
    planName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    calories: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    meals: z.ZodOptional<z.ZodAny>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    calories?: number | undefined;
    meals?: any;
    startDate?: string | undefined;
    endDate?: string | undefined;
    planName?: string | undefined;
}, {
    isActive?: boolean | undefined;
    description?: string | undefined;
    calories?: number | undefined;
    meals?: any;
    startDate?: string | undefined;
    endDate?: string | undefined;
    planName?: string | undefined;
}>;
export declare const createInquirySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodString;
    source: z.ZodDefault<z.ZodOptional<z.ZodEnum<["WALK_IN", "PHONE", "WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "OTHER"]>>>;
    interest: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    followUpDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    source: "WALK_IN" | "PHONE" | "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "OTHER";
    email?: string | undefined;
    notes?: string | undefined;
    interest?: string | undefined;
    followUpDate?: string | undefined;
}, {
    name: string;
    phone: string;
    email?: string | undefined;
    notes?: string | undefined;
    source?: "WALK_IN" | "PHONE" | "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "OTHER" | undefined;
    interest?: string | undefined;
    followUpDate?: string | undefined;
}>;
export declare const updateInquirySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["WALK_IN", "PHONE", "WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "OTHER"]>>>>;
    interest: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    followUpDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "CONVERTED", "FOLLOW_UP"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
    source?: "WALK_IN" | "PHONE" | "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "OTHER" | undefined;
    interest?: string | undefined;
    status?: "NEW" | "CONTACTED" | "INTERESTED" | "NOT_INTERESTED" | "CONVERTED" | "FOLLOW_UP" | undefined;
    followUpDate?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
    source?: "WALK_IN" | "PHONE" | "WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "OTHER" | undefined;
    interest?: string | undefined;
    status?: "NEW" | "CONTACTED" | "INTERESTED" | "NOT_INTERESTED" | "CONVERTED" | "FOLLOW_UP" | undefined;
    followUpDate?: string | undefined;
}>;
export declare const memberIdParamSchema: z.ZodObject<{
    memberId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    memberId: string;
}, {
    memberId: string;
}>;
export declare const ptMemberIdParamSchema: z.ZodObject<{
    ptMemberId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ptMemberId: string;
}, {
    ptMemberId: string;
}>;
export declare const createDietPlanSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    meals: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        time: z.ZodString;
        items: z.ZodArray<z.ZodString, "many">;
        calories: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }, {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }>, "many">>;
    totalCalories: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    description?: string | undefined;
    meals?: {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }[] | undefined;
    totalCalories?: number | undefined;
}, {
    name: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    meals?: {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }[] | undefined;
    totalCalories?: number | undefined;
}>;
export declare const updateDietPlanSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meals: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        time: z.ZodString;
        items: z.ZodArray<z.ZodString, "many">;
        calories: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }, {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }>, "many">>>;
    totalCalories: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    meals?: {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }[] | undefined;
    totalCalories?: number | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    meals?: {
        name: string;
        items: string[];
        time: string;
        calories?: number | undefined;
    }[] | undefined;
    totalCalories?: number | undefined;
}>;
export declare const createExercisePlanSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    exercises: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        sets: z.ZodNumber;
        reps: z.ZodNumber;
        restTime: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }, {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }>, "many">>;
    durationMinutes: z.ZodOptional<z.ZodNumber>;
    difficulty: z.ZodOptional<z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED"]>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    description?: string | undefined;
    exercises?: {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }[] | undefined;
    durationMinutes?: number | undefined;
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
}, {
    name: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    exercises?: {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }[] | undefined;
    durationMinutes?: number | undefined;
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
}>;
export declare const updateExercisePlanSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    exercises: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        sets: z.ZodNumber;
        reps: z.ZodNumber;
        restTime: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }, {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }>, "many">>>;
    durationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    difficulty: z.ZodOptional<z.ZodOptional<z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED"]>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    exercises?: {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }[] | undefined;
    durationMinutes?: number | undefined;
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    exercises?: {
        name: string;
        sets: number;
        reps: number;
        notes?: string | undefined;
        restTime?: number | undefined;
    }[] | undefined;
    durationMinutes?: number | undefined;
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
}>;
export declare const assignPlanSchema: z.ZodObject<{
    memberId: z.ZodString;
    planId: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    memberId: string;
    planId: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    memberId: string;
    planId: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    height: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    fitnessGoal: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    height?: number | undefined;
    weight?: number | undefined;
    fitnessGoal?: string | undefined;
}, {
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    height?: number | undefined;
    weight?: number | undefined;
    fitnessGoal?: string | undefined;
}>;
export declare const validate: (schema: ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validate.middleware.d.ts.map