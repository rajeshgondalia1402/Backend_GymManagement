import { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest, Gym, CreateGymRequest, UpdateGymRequest, GymOwner, CreateGymOwnerRequest, DashboardStats, PaginationParams } from './admin.types';
declare class AdminService {
    getDashboardStats(): Promise<DashboardStats>;
    getSubscriptionPlans(params: PaginationParams): Promise<{
        plans: SubscriptionPlan[];
        total: number;
    }>;
    getSubscriptionPlanById(id: string): Promise<SubscriptionPlan>;
    createSubscriptionPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan>;
    updateSubscriptionPlan(id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan>;
    deleteSubscriptionPlan(id: string): Promise<void>;
    getGyms(params: PaginationParams): Promise<{
        gyms: Gym[];
        total: number;
    }>;
    getGymById(id: string): Promise<Gym>;
    createGym(data: CreateGymRequest): Promise<Gym>;
    updateGym(id: string, data: UpdateGymRequest): Promise<Gym>;
    deleteGym(id: string): Promise<void>;
    toggleGymStatus(id: string): Promise<Gym>;
    getGymOwners(params: PaginationParams): Promise<{
        owners: GymOwner[];
        total: number;
    }>;
    createGymOwner(data: CreateGymOwnerRequest): Promise<GymOwner>;
    toggleUserStatus(id: string): Promise<{
        isActive: boolean;
    }>;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=admin.service.d.ts.map