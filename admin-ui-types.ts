// types/subscription-plan.ts

export type PlanCategory = 
  | 'Basic / Entry-Level Plans'
  | 'Standard / Popular Plans'
  | 'Premium / Advanced Plans'
  | 'Duration-Based (Common in India)';

export type Currency = 'INR' | 'USD';

export interface SubscriptionPlan {
  id: string;
  planName: PlanCategory;
  description: string;
  priceCurrency: Currency;
  priceAmount: number;
  durationDays: number;
  features: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionPlanFormData {
  planName: PlanCategory;
  description: string;
  priceCurrency: Currency;
  priceAmount: number;
  durationDays: number;
  features: string;
  isActive: boolean;
}

export interface SubscriptionPlanListResponse {
  plans: SubscriptionPlan[];
  total: number;
  page: number;
  pageSize: number;
}
