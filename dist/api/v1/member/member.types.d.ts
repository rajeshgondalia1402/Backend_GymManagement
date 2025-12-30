export interface MemberProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    healthNotes?: string;
    isActive: boolean;
    gymId: string;
    gym?: {
        id: string;
        name: string;
        address?: string | null;
        phone?: string | null;
    };
    trainerId?: string;
    trainer?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        specialization?: string;
    };
    membershipStartDate?: Date;
    membershipEndDate?: Date;
    membershipStatus?: string;
    createdAt: Date;
}
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    healthNotes?: string;
}
export interface MemberDashboardStats {
    daysRemaining: number;
    totalWorkouts: number;
    activeDietPlan?: {
        id: string;
        name: string;
    };
    activeExercisePlans: number;
    trainer?: {
        id: string;
        name: string;
        specialization?: string;
    };
}
export interface AssignedDietPlan {
    id: string;
    dietPlan: {
        id: string;
        name: string;
        description?: string;
        meals?: any[];
        totalCalories?: number;
    };
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
}
export interface AssignedExercisePlan {
    id: string;
    exercisePlan: {
        id: string;
        name: string;
        description?: string;
        exercises?: any[];
        durationMinutes?: number;
        difficulty?: string;
    };
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
}
export interface Membership {
    startDate?: Date;
    endDate?: Date;
    daysRemaining: number;
    isActive: boolean;
    gym: {
        id: string;
        name: string;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
    };
}
//# sourceMappingURL=member.types.d.ts.map