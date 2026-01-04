import { Trainer, CreateTrainerRequest, UpdateTrainerRequest, Member, CreateMemberRequest, UpdateMemberRequest, DietPlan, CreateDietPlanRequest, UpdateDietPlanRequest, ExercisePlan, CreateExercisePlanRequest, UpdateExercisePlanRequest, AssignPlanRequest, GymOwnerDashboardStats, PaginationParams, PTMember, CreatePTMemberRequest, UpdatePTMemberRequest, Supplement, CreateSupplementRequest, UpdateSupplementRequest, MemberDietPlan, CreateMemberDietPlanRequest, UpdateMemberDietPlanRequest, Inquiry, CreateInquiryRequest, UpdateInquiryRequest, MemberReport, PTProgressReport, TrainerReport, RevenueReport, ExpenseGroup, CreateExpenseGroupRequest, UpdateExpenseGroupRequest, Designation, CreateDesignationRequest, UpdateDesignationRequest } from './gym-owner.types';
declare class GymOwnerService {
    getDashboardStats(gymId: string): Promise<GymOwnerDashboardStats>;
    getTrainers(gymId: string, params: PaginationParams): Promise<{
        trainers: Trainer[];
        total: number;
    }>;
    getTrainerById(gymId: string, trainerId: string): Promise<Trainer>;
    createTrainer(gymId: string, data: CreateTrainerRequest): Promise<Trainer>;
    updateTrainer(gymId: string, trainerId: string, data: UpdateTrainerRequest): Promise<Trainer>;
    deleteTrainer(gymId: string, trainerId: string): Promise<void>;
    getMembers(gymId: string, params: PaginationParams): Promise<{
        members: Member[];
        total: number;
    }>;
    getMemberById(gymId: string, memberId: string): Promise<Member>;
    createMember(gymId: string, data: CreateMemberRequest): Promise<Member>;
    updateMember(gymId: string, memberId: string, data: UpdateMemberRequest): Promise<Member>;
    deleteMember(gymId: string, memberId: string): Promise<void>;
    getDietPlans(gymId: string, params: PaginationParams): Promise<{
        plans: DietPlan[];
        total: number;
    }>;
    getDietPlanById(gymId: string, planId: string): Promise<DietPlan>;
    createDietPlan(gymId: string, data: CreateDietPlanRequest): Promise<DietPlan>;
    updateDietPlan(gymId: string, planId: string, data: UpdateDietPlanRequest): Promise<DietPlan>;
    deleteDietPlan(gymId: string, planId: string): Promise<void>;
    getExercisePlans(gymId: string, params: PaginationParams): Promise<{
        plans: ExercisePlan[];
        total: number;
    }>;
    getExercisePlanById(gymId: string, planId: string): Promise<ExercisePlan>;
    createExercisePlan(gymId: string, data: CreateExercisePlanRequest): Promise<ExercisePlan>;
    updateExercisePlan(gymId: string, planId: string, data: UpdateExercisePlanRequest): Promise<ExercisePlan>;
    deleteExercisePlan(gymId: string, planId: string): Promise<void>;
    assignDietPlan(gymId: string, data: AssignPlanRequest): Promise<void>;
    assignExercisePlan(gymId: string, data: AssignPlanRequest): Promise<void>;
    assignTrainer(gymId: string, memberId: string, trainerId: string): Promise<Member>;
    toggleTrainerStatus(gymId: string, trainerId: string): Promise<{
        isActive: boolean;
    }>;
    toggleMemberStatus(gymId: string, memberId: string): Promise<{
        isActive: boolean;
    }>;
    getPTMembers(gymId: string, params: PaginationParams): Promise<{
        ptMembers: PTMember[];
        total: number;
    }>;
    getPTMemberById(gymId: string, ptMemberId: string): Promise<PTMember>;
    createPTMember(gymId: string, userId: string, data: CreatePTMemberRequest): Promise<PTMember>;
    updatePTMember(gymId: string, userId: string, ptMemberId: string, data: UpdatePTMemberRequest): Promise<PTMember>;
    getSupplements(gymId: string, ptMemberId: string): Promise<Supplement[]>;
    createSupplement(gymId: string, userId: string, ptMemberId: string, data: CreateSupplementRequest): Promise<Supplement>;
    updateSupplement(gymId: string, userId: string, supplementId: string, data: UpdateSupplementRequest): Promise<Supplement>;
    getMemberDietPlans(gymId: string, memberId: string): Promise<MemberDietPlan[]>;
    createMemberDietPlan(gymId: string, userId: string, memberId: string, data: CreateMemberDietPlanRequest): Promise<MemberDietPlan>;
    updateMemberDietPlan(gymId: string, userId: string, planId: string, data: UpdateMemberDietPlanRequest): Promise<MemberDietPlan>;
    getInquiries(gymId: string, params: PaginationParams): Promise<{
        inquiries: Inquiry[];
        total: number;
    }>;
    createInquiry(gymId: string, userId: string, data: CreateInquiryRequest): Promise<Inquiry>;
    updateInquiry(gymId: string, userId: string, inquiryId: string, data: UpdateInquiryRequest): Promise<Inquiry>;
    getMemberReport(gymId: string): Promise<MemberReport>;
    getPTProgressReport(gymId: string): Promise<PTProgressReport>;
    getTrainerReport(gymId: string): Promise<TrainerReport>;
    getRevenueReport(gymId: string): Promise<RevenueReport>;
    getExpenseGroups(gymId: string): Promise<ExpenseGroup[]>;
    getExpenseGroupById(gymId: string, id: string): Promise<ExpenseGroup>;
    createExpenseGroup(gymId: string, data: CreateExpenseGroupRequest): Promise<ExpenseGroup>;
    updateExpenseGroup(gymId: string, id: string, data: UpdateExpenseGroupRequest): Promise<ExpenseGroup>;
    deleteExpenseGroup(gymId: string, id: string): Promise<void>;
    getDesignations(gymId: string): Promise<Designation[]>;
    getDesignationById(gymId: string, id: string): Promise<Designation>;
    createDesignation(gymId: string, data: CreateDesignationRequest): Promise<Designation>;
    updateDesignation(gymId: string, id: string, data: UpdateDesignationRequest): Promise<Designation>;
    deleteDesignation(gymId: string, id: string): Promise<void>;
}
declare const _default: GymOwnerService;
export default _default;
//# sourceMappingURL=gym-owner.service.d.ts.map