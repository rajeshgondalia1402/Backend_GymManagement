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
  memberSize?: number;       // Expected number of members
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
  memberSize?: number;       // Expected number of members
  note?: string;             // Terms and Conditions on receipts
  gymLogo?: string;          // Path to gym logo image
  subscriptionPlanId?: string;
  ownerId?: string;
  extraDiscount?: number;
}

export interface UpdateGymRequest extends Partial<CreateGymRequest> {}

export interface GymOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  /** Masked password hint showing only last 4 characters (e.g., '****word') - never exposes full password */
  passwordHint?: string;
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

export interface UpdateGymOwnerRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;  // Optional - allows setting a new password
  phone?: string;
  isActive?: boolean;
}

/**
 * Response for gym owner password reset
 */
export interface ResetGymOwnerPasswordResponse {
  /** The gym owner's ID */
  ownerId: string;
  /** The gym owner's email */
  email: string;
  /** The new temporary password - should be communicated securely */
  temporaryPassword: string;
  /** Message for the admin */
  message: string;
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

// Gym Subscription History types
export interface GymSubscriptionHistory {
  id: string;
  subscriptionNumber: string;
  gymId: string;
  gymName?: string;
  subscriptionPlanId: string;
  subscriptionPlanName?: string;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  renewalDate: Date;
  previousPlanId?: string | null;
  previousPlanName?: string | null;
  previousSubscriptionEnd?: Date | null;
  renewalType: string;
  planAmount?: number | null;
  extraDiscount?: number | null;
  amount: number;
  paymentMode?: string | null;
  paymentStatus: string;
  paidAmount?: number | null;
  pendingAmount?: number | null;
  isActive: boolean;
  notes?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenewGymSubscriptionRequest {
  subscriptionPlanId: string;
  subscriptionStart?: string;
  paymentMode?: string;
  paidAmount?: number;
  extraDiscount?: number;
  notes?: string;
}

export interface GymSubscriptionHistoryParams extends PaginationParams {
  paymentStatus?: string;
  renewalType?: string;
}

// Gym Inquiry types
export interface GymInquiry {
  id: string;
  gymName: string;
  address1?: string | null;
  address2?: string | null;
  state?: string | null;
  city?: string | null;
  mobileNo: string;
  email?: string | null;
  subscriptionPlanId: string;
  note?: string | null;
  sellerName?: string | null;
  sellerMobileNo?: string | null;
  nextFollowupDate?: Date | null;
  memberSize?: number | null;
  enquiryTypeId?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan?: { id: string; name: string; price: any; durationDays: number };
  enquiryType?: { id: string; name: string };
  followups?: GymInquiryFollowup[];
  _count?: { followups: number };
}

export interface CreateGymInquiryRequest {
  gymName: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  mobileNo: string;
  email?: string;
  subscriptionPlanId: string;
  note?: string;
  sellerName?: string;
  sellerMobileNo?: string;
  nextFollowupDate?: string;
  memberSize?: number;
  enquiryTypeId: string;
}

export interface UpdateGymInquiryRequest extends Partial<CreateGymInquiryRequest> {}

export interface GymInquiryFollowup {
  id: string;
  gymInquiryId: string;
  followupDate: Date;
  note?: string | null;
  createdBy?: string | null;
  createdAt: Date;
}

export interface CreateGymInquiryFollowupRequest {
  followupDate?: string;
  note?: string;
}

export interface GymInquiryParams extends PaginationParams {
  subscriptionPlanId?: string;
  isActive?: boolean;
}
