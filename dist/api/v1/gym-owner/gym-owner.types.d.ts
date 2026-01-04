export interface Trainer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    specialization?: string;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateTrainerRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    specialization?: string;
}
export interface UpdateTrainerRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    specialization?: string;
}
export interface Member {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    gymId: string;
    trainerId?: string;
    trainer?: Trainer;
    memberType: 'REGULAR' | 'PT';
    membershipStartDate?: Date;
    membershipEndDate?: Date;
    createdAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateMemberRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    trainerId?: string;
    memberType?: 'REGULAR' | 'PT';
    membershipStartDate?: string;
    membershipEndDate?: string;
}
export interface UpdateMemberRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    trainerId?: string;
    memberType?: 'REGULAR' | 'PT';
    membershipStartDate?: string;
    membershipEndDate?: string;
}
export interface PTMember {
    id: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    trainerId: string;
    trainerName: string;
    packageName: string;
    sessionsTotal: number;
    sessionsUsed: number;
    sessionsRemaining: number;
    sessionDuration: number;
    startDate: Date;
    endDate?: Date;
    goals?: string;
    notes?: string;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreatePTMemberRequest {
    memberId: string;
    trainerId: string;
    packageName: string;
    sessionsTotal: number;
    sessionDuration?: number;
    startDate?: string;
    endDate?: string;
    goals?: string;
    notes?: string;
}
export interface UpdatePTMemberRequest {
    trainerId?: string;
    packageName?: string;
    sessionsTotal?: number;
    sessionsUsed?: number;
    sessionDuration?: number;
    endDate?: string;
    goals?: string;
    notes?: string;
    isActive?: boolean;
}
export interface Supplement {
    id: string;
    ptMemberId: string;
    memberName?: string;
    name: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    notes?: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateSupplementRequest {
    name: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    notes?: string;
    startDate?: string;
    endDate?: string;
}
export interface UpdateSupplementRequest {
    name?: string;
    dosage?: string;
    frequency?: string;
    timing?: string;
    notes?: string;
    endDate?: string;
    isActive?: boolean;
}
export interface MemberDietPlan {
    id: string;
    memberId: string;
    memberName?: string;
    planName: string;
    description?: string;
    calories?: number;
    meals: any;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateMemberDietPlanRequest {
    planName: string;
    description?: string;
    calories?: number;
    meals: any;
    startDate?: string;
    endDate?: string;
}
export interface UpdateMemberDietPlanRequest {
    planName?: string;
    description?: string;
    calories?: number;
    meals?: any;
    endDate?: string;
    isActive?: boolean;
}
export interface Inquiry {
    id: string;
    name: string;
    email?: string;
    phone: string;
    source: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
    interest?: string;
    notes?: string;
    status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED' | 'FOLLOW_UP';
    followUpDate?: Date;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateInquiryRequest {
    name: string;
    email?: string;
    phone: string;
    source?: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
    interest?: string;
    notes?: string;
    followUpDate?: string;
}
export interface UpdateInquiryRequest {
    name?: string;
    email?: string;
    phone?: string;
    source?: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
    interest?: string;
    notes?: string;
    status?: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED' | 'FOLLOW_UP';
    followUpDate?: string;
}
export interface DietPlan {
    id: string;
    name: string;
    description?: string;
    meals?: any[];
    totalCalories?: number;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
}
export interface CreateDietPlanRequest {
    name: string;
    description?: string;
    meals?: any[];
    totalCalories?: number;
    isActive?: boolean;
}
export interface UpdateDietPlanRequest extends Partial<CreateDietPlanRequest> {
}
export interface ExercisePlan {
    id: string;
    name: string;
    description?: string;
    exercises?: any[];
    durationMinutes?: number;
    difficulty?: string;
    isActive: boolean;
    gymId: string;
    createdAt: Date;
}
export interface CreateExercisePlanRequest {
    name: string;
    description?: string;
    exercises?: any[];
    durationMinutes?: number;
    difficulty?: string;
    isActive?: boolean;
}
export interface UpdateExercisePlanRequest extends Partial<CreateExercisePlanRequest> {
}
export interface AssignPlanRequest {
    memberId: string;
    planId: string;
    startDate?: string;
    endDate?: string;
}
export interface GymOwnerDashboardStats {
    totalMembers: number;
    totalTrainers: number;
    activeMembers: number;
    expiringMemberships: number;
    totalDietPlans: number;
    totalExercisePlans: number;
    totalPTMembers: number;
    totalInquiries: number;
    newInquiries: number;
}
export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    memberType?: 'REGULAR' | 'PT';
    status?: string;
    isActive?: boolean;
}
export interface MemberReport {
    totalMembers: number;
    activeMembers: number;
    regularMembers: number;
    ptMembers: number;
    newMembersThisMonth: number;
    expiringThisWeek: number;
    membersByMonth: {
        month: string;
        count: number;
    }[];
}
export interface PTProgressReport {
    totalPTMembers: number;
    activePTMembers: number;
    totalSessions: number;
    completedSessions: number;
    remainingSessions: number;
    completionRate: number;
    ptMembersByTrainer: {
        trainerName: string;
        count: number;
    }[];
}
export interface TrainerReport {
    totalTrainers: number;
    activeTrainers: number;
    trainersWithPTMembers: number;
    trainerWorkload: {
        trainerName: string;
        ptMembers: number;
        totalSessions: number;
    }[];
}
export interface RevenueReport {
    totalMembers: number;
    ptMembers: number;
    regularMembers: number;
    membershipsByStatus: {
        status: string;
        count: number;
    }[];
    inquiriesConversionRate: number;
}
export interface ExpenseGroup {
    id: string;
    expenseGroupName: string;
    gymId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateExpenseGroupRequest {
    expenseGroupName: string;
}
export interface UpdateExpenseGroupRequest {
    expenseGroupName: string;
}
export interface Designation {
    id: string;
    designationName: string;
    gymId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateDesignationRequest {
    designationName: string;
}
export interface UpdateDesignationRequest {
    designationName: string;
}
//# sourceMappingURL=gym-owner.types.d.ts.map