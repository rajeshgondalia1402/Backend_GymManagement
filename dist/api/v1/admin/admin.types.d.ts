export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    durationDays: number;
    maxMembers?: number;
    maxTrainers?: number;
    features?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateSubscriptionPlanRequest {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    durationDays: number;
    maxMembers?: number;
    maxTrainers?: number;
    features?: string | string[];
    isActive?: boolean;
}
export interface UpdateSubscriptionPlanRequest extends Partial<CreateSubscriptionPlanRequest> {
}
export interface Gym {
    id: string;
    name: string;
    address?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    phone?: string;
    mobileNo?: string;
    phoneNo?: string;
    email?: string;
    gstRegNo?: string;
    website?: string;
    note?: string;
    logo?: string;
    gymLogo?: string;
    isActive: boolean;
    subscriptionPlanId?: string;
    subscriptionPlan?: SubscriptionPlan;
    ownerId?: string;
    owner?: GymOwner;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateGymRequest {
    name: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    mobileNo?: string;
    phoneNo?: string;
    email?: string;
    gstRegNo?: string;
    website?: string;
    note?: string;
    gymLogo?: string;
    subscriptionPlanId?: string;
    ownerId?: string;
}
export interface UpdateGymRequest extends Partial<CreateGymRequest> {
}
export interface GymOwner {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    gymId?: string;
    gymName?: string;
    createdAt: Date;
}
export interface CreateGymOwnerRequest {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
}
export interface DashboardStats {
    totalGyms: number;
    totalGymOwners: number;
    totalMembers: number;
    totalTrainers: number;
    activeSubscriptions: number;
    revenueThisMonth: number;
}
export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface Occupation {
    id: string;
    occupationName: string;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
}
export interface CreateOccupationRequest {
    occupationName: string;
    description?: string;
}
export interface UpdateOccupationRequest {
    occupationName?: string;
    description?: string;
    isActive?: boolean;
}
export interface EnquiryType {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
}
export interface CreateEnquiryTypeRequest {
    name: string;
}
export interface UpdateEnquiryTypeRequest {
    name?: string;
    isActive?: boolean;
}
export interface PaymentType {
    id: string;
    paymentTypeName: string;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
}
export interface CreatePaymentTypeRequest {
    paymentTypeName: string;
    description?: string;
}
export interface UpdatePaymentTypeRequest {
    paymentTypeName?: string;
    description?: string;
    isActive?: boolean;
}
//# sourceMappingURL=admin.types.d.ts.map