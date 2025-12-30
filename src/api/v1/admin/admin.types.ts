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

export interface UpdateSubscriptionPlanRequest extends Partial<CreateSubscriptionPlanRequest> {}

export interface Gym {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  subscriptionPlanId: string;
  subscriptionPlan?: SubscriptionPlan;
  ownerId?: string;
  owner?: GymOwner;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGymRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  subscriptionPlanId: string;
  ownerId?: string;
}

export interface UpdateGymRequest extends Partial<CreateGymRequest> {}

export interface GymOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  gymId?: string;
  createdAt: Date;
}

export interface CreateGymOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
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
