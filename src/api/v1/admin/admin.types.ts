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
  address?: string;          // Legacy field
  address1?: string;         // Primary address line
  address2?: string;         // Secondary address line
  city?: string;
  state?: string;
  zipcode?: string;          // Only numbers allowed
  phone?: string;            // Legacy field
  mobileNo?: string;         // Only numbers allowed
  phoneNo?: string;          // Only numbers allowed
  email?: string;            // Email with validation
  gstRegNo?: string;         // GST Registration Number
  website?: string;
  note?: string;             // Terms and Conditions on receipts
  logo?: string;             // Legacy field
  gymLogo?: string;          // Path to gym logo image
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
  address1?: string;         // Primary address line
  address2?: string;         // Secondary address line
  city?: string;
  state?: string;
  zipcode?: string;          // Only numbers allowed
  mobileNo?: string;         // Only numbers allowed
  phoneNo?: string;          // Only numbers allowed
  email?: string;            // Email with validation
  gstRegNo?: string;         // GST Registration Number
  website?: string;
  note?: string;             // Terms and Conditions on receipts
  gymLogo?: string;          // Path to gym logo image
  subscriptionPlanId?: string;
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

// Occupation Master types
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

// Enquiry Type Master types
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

// Payment Type Master types
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
