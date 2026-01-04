import { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest, Gym, CreateGymRequest, UpdateGymRequest, GymOwner, CreateGymOwnerRequest, DashboardStats, PaginationParams, Occupation, CreateOccupationRequest, UpdateOccupationRequest, EnquiryType, CreateEnquiryTypeRequest, UpdateEnquiryTypeRequest, PaymentType, CreatePaymentTypeRequest, UpdatePaymentTypeRequest } from './admin.types';
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
    assignGymOwner(gymId: string, ownerId: string): Promise<Gym>;
    getGymOwners(params: PaginationParams): Promise<{
        owners: GymOwner[];
        total: number;
    }>;
    createGymOwner(data: CreateGymOwnerRequest): Promise<GymOwner>;
    toggleUserStatus(id: string): Promise<{
        isActive: boolean;
    }>;
    getOccupations(): Promise<Occupation[]>;
    getOccupationById(id: string): Promise<Occupation>;
    createOccupation(data: CreateOccupationRequest, createdBy?: string): Promise<Occupation>;
    updateOccupation(id: string, data: UpdateOccupationRequest): Promise<Occupation>;
    deleteOccupation(id: string): Promise<Occupation>;
    getEnquiryTypes(): Promise<EnquiryType[]>;
    getEnquiryTypeById(id: string): Promise<EnquiryType>;
    createEnquiryType(data: CreateEnquiryTypeRequest, createdBy?: string): Promise<EnquiryType>;
    updateEnquiryType(id: string, data: UpdateEnquiryTypeRequest): Promise<EnquiryType>;
    deleteEnquiryType(id: string): Promise<EnquiryType>;
    getPaymentTypes(): Promise<PaymentType[]>;
    getPaymentTypeById(id: string): Promise<PaymentType>;
    createPaymentType(data: CreatePaymentTypeRequest, createdBy?: string): Promise<PaymentType>;
    updatePaymentType(id: string, data: UpdatePaymentTypeRequest): Promise<PaymentType>;
    deletePaymentType(id: string): Promise<PaymentType>;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=admin.service.d.ts.map