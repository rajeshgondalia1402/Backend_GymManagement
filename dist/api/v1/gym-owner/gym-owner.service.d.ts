import { Trainer, CreateTrainerRequest, UpdateTrainerRequest, Member, CreateMemberRequest, UpdateMemberRequest, DietPlan, CreateDietPlanRequest, UpdateDietPlanRequest, ExercisePlan, CreateExercisePlanRequest, UpdateExercisePlanRequest, AssignPlanRequest, GymOwnerDashboardStats, PaginationParams } from './gym-owner.types';
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
}
declare const _default: GymOwnerService;
export default _default;
//# sourceMappingURL=gym-owner.service.d.ts.map