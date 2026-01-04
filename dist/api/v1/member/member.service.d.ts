import { MemberProfile, UpdateProfileRequest, MemberDashboardStats, AssignedDietPlan, AssignedExercisePlan, Membership } from './member.types';
declare class MemberService {
    getProfile(userId: string): Promise<MemberProfile>;
    updateProfile(userId: string, data: UpdateProfileRequest): Promise<MemberProfile>;
    getDashboard(userId: string): Promise<MemberDashboardStats>;
    getTrainer(userId: string): Promise<any>;
    getDietPlan(userId: string): Promise<AssignedDietPlan | null>;
    getExercisePlans(userId: string): Promise<AssignedExercisePlan[]>;
    getMembership(userId: string): Promise<Membership>;
    getMyDietPlan(userId: string): Promise<any>;
    getMyDietPlanHistory(userId: string): Promise<any[]>;
    getMySupplements(userId: string): Promise<any[]>;
    getMyPTMembership(userId: string): Promise<any | null>;
}
declare const _default: MemberService;
export default _default;
//# sourceMappingURL=member.service.d.ts.map