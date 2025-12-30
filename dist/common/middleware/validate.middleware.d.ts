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
    maxMembers: z.ZodNumber;
    maxTrainers: z.ZodNumber;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    price: number;
    durationDays: number;
    currency: string;
    maxMembers: number;
    maxTrainers: number;
    description?: string | undefined;
    features?: string[] | undefined;
}, {
    name: string;
    price: number;
    durationDays: number;
    maxMembers: number;
    maxTrainers: number;
    isActive?: boolean | undefined;
    description?: string | undefined;
    features?: string[] | undefined;
    currency?: string | undefined;
}>;
export declare const updateSubscriptionPlanSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    durationDays: z.ZodOptional<z.ZodNumber>;
    maxMembers: z.ZodOptional<z.ZodNumber>;
    maxTrainers: z.ZodOptional<z.ZodNumber>;
    features: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    price?: number | undefined;
    durationDays?: number | undefined;
    features?: string[] | undefined;
    currency?: string | undefined;
    maxMembers?: number | undefined;
    maxTrainers?: number | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    price?: number | undefined;
    durationDays?: number | undefined;
    features?: string[] | undefined;
    currency?: string | undefined;
    maxMembers?: number | undefined;
    maxTrainers?: number | undefined;
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
export declare const createGymOwnerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
}, {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
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
    membershipStartDate: z.ZodOptional<z.ZodString>;
    membershipEndDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    phone: string;
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
    membershipStartDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    membershipEndDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    trainerId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    membershipStartDate?: string | undefined;
    membershipEndDate?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    trainerId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    membershipStartDate?: string | undefined;
    membershipEndDate?: string | undefined;
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
        restTime?: number | undefined;
        notes?: string | undefined;
    }, {
        name: string;
        sets: number;
        reps: number;
        restTime?: number | undefined;
        notes?: string | undefined;
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
        restTime?: number | undefined;
        notes?: string | undefined;
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
        restTime?: number | undefined;
        notes?: string | undefined;
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
        restTime?: number | undefined;
        notes?: string | undefined;
    }, {
        name: string;
        sets: number;
        reps: number;
        restTime?: number | undefined;
        notes?: string | undefined;
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
        restTime?: number | undefined;
        notes?: string | undefined;
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
        restTime?: number | undefined;
        notes?: string | undefined;
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