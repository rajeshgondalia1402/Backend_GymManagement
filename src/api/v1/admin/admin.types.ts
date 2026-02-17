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

// =============================================
// Admin Dashboard V2 Types
// =============================================

export interface AdminDashboardCounts {
  totalActiveGyms: number;
  totalActiveGymInquiries: number;
  todaysFollowupGymInquiries: number;
  twoDaysLeftExpiredGyms: number;
  totalExpiredGyms: number;
  totalRenewalGyms: number;
  totalMembers: number;
  mostPopularSubscriptionPlan: {
    planId: string;
    planName: string;
    activeGymCount: number;
  } | null;
  recentRegisteredGyms: number; // Last 7 days
  totalIncome: number;
  totalExpense: number;
  thisMonthsIncome: number;
  thisMonthsExpense: number;
}

export interface DashboardDetailParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActiveGymDetail {
  id: string;
  name: string;
  email?: string | null;
  mobileNo?: string | null;
  city?: string | null;
  state?: string | null;
  isActive: boolean;
  subscriptionPlanName?: string | null;
  subscriptionStart?: Date | null;
  subscriptionEnd?: Date | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  memberCount: number;
  createdAt: Date;
}

export interface GymInquiryDetail {
  id: string;
  gymName: string;
  mobileNo: string;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  subscriptionPlanName?: string | null;
  enquiryTypeName?: string | null;
  sellerName?: string | null;
  nextFollowupDate?: Date | null;
  memberSize?: number | null;
  note?: string | null;
  followupCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ExpiringGymDetail {
  id: string;
  name: string;
  email?: string | null;
  mobileNo?: string | null;
  city?: string | null;
  state?: string | null;
  subscriptionPlanName?: string | null;
  subscriptionStart?: Date | null;
  subscriptionEnd?: Date | null;
  daysLeft: number;
  ownerName?: string | null;
  ownerEmail?: string | null;
}

export interface ExpiredGymDetail {
  id: string;
  name: string;
  email?: string | null;
  mobileNo?: string | null;
  city?: string | null;
  state?: string | null;
  subscriptionPlanName?: string | null;
  subscriptionStart?: Date | null;
  subscriptionEnd?: Date | null;
  expiredDaysAgo: number;
  ownerName?: string | null;
  ownerEmail?: string | null;
}

export interface RenewalGymDetail {
  id: string;
  subscriptionNumber: string;
  gymName: string;
  subscriptionPlanName: string;
  renewalType: string;
  renewalDate: Date;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  amount: number;
  paidAmount?: number | null;
  pendingAmount?: number | null;
  paymentStatus: string;
  paymentMode?: string | null;
}

export interface MemberDetail {
  id: string;
  memberId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  memberType: string;
  membershipStatus: string;
  membershipStart: Date;
  membershipEnd: Date;
  gymName: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PopularPlanGymDetail {
  id: string;
  name: string;
  email?: string | null;
  mobileNo?: string | null;
  city?: string | null;
  state?: string | null;
  subscriptionStart?: Date | null;
  subscriptionEnd?: Date | null;
  ownerName?: string | null;
}

export interface IncomeDetail {
  id: string;
  subscriptionNumber: string;
  gymName: string;
  subscriptionPlanName: string;
  amount: number;
  paidAmount?: number | null;
  paymentMode?: string | null;
  paymentStatus: string;
  renewalType: string;
  renewalDate: Date;
}

export interface ExpenseDetail {
  id: string;
  name: string;
  expenseGroupName?: string;
  description?: string | null;
  amount: number;
  paymentMode: string;
  expenseDate: Date;
  createdAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Gym subscription status filter types
export type GymSubscriptionStatusFilter = 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';

export interface GymParams extends PaginationParams {
  subscriptionStatus?: GymSubscriptionStatusFilter;
}

// Plan Category Master types
export interface PlanCategory {
  id: string;
  categoryName: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
}

export interface CreatePlanCategoryRequest {
  categoryName: string;
  description?: string;
}

export interface UpdatePlanCategoryRequest {
  categoryName?: string;
  description?: string;
  isActive?: boolean;
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

// Admin Members List types
export interface AdminMembersParams extends PaginationParams {
  gymId?: string;
  gymOwnerId?: string;
  membershipStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  memberType?: 'REGULAR' | 'PT' | 'REGULAR_PT';
  isActive?: boolean;
}

export interface AdminMemberDetails {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone?: string | null;
  altContactNo?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  occupation?: string | null;
  memberPhoto?: string | null;
  memberType: string;
  isActive: boolean;

  // User credentials
  user: {
    id: string;
    email: string;
    name: string;
    passwordHint?: string;
    isActive: boolean;
  };

  // Gym details
  gym: {
    id: string;
    name: string;
    email?: string | null;
    mobileNo?: string | null;
  };

  // Current subscription details
  subscription: {
    membershipStart: Date;
    membershipEnd: Date;
    membershipStatus: string;
    daysRemaining: number;
  };

  // Package & fees details
  package: {
    coursePackageId?: string | null;
    coursePackageName?: string | null;
    packageFees: number;
    maxDiscount: number;
    afterDiscount: number;
    extraDiscount: number;
    finalFees: number;
  };

  // PT addon details (if applicable)
  ptAddon?: {
    hasPTAddon: boolean;
    ptPackageName?: string | null;
    ptPackageFees: number;
    ptMaxDiscount: number;
    ptAfterDiscount: number;
    ptExtraDiscount: number;
    ptFinalFees: number;
  } | null;

  // Payment summary
  payment: {
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
    lastPaymentDate?: Date | null;
  };

  // Assigned trainer details
  trainer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    specialization?: string | null;
  } | null;

  // PT member details (if PT type)
  ptDetails?: {
    id: string;
    packageName: string;
    sessionsTotal: number;
    sessionsUsed: number;
    sessionsRemaining: number;
    startDate: Date;
    endDate?: Date | null;
    goals?: string | null;
  } | null;

  // Assigned diet plan details
  dietPlan?: {
    id: string;
    templateId: string;
    templateName: string;
    startDate: Date;
    endDate?: Date | null;
    meals: {
      mealNo: number;
      title: string;
      description: string;
      time: string;
    }[];
  } | null;

  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// Admin Expense Group Master Types
// =============================================

export interface AdminExpenseGroup {
  id: string;
  expenseGroupName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdminExpenseGroupRequest {
  expenseGroupName: string;
}

export interface UpdateAdminExpenseGroupRequest {
  expenseGroupName: string;
}

// =============================================
// Admin Expense Management Types
// =============================================

export type AdminPaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'NET_BANKING' | 'OTHER';

export interface AdminExpense {
  id: string;
  expenseDate: Date;
  name: string;
  expenseGroupId: string;
  expenseGroupName?: string;
  description?: string;
  paymentMode: AdminPaymentMode;
  amount: number;
  attachments?: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdminExpenseRequest {
  expenseDate?: string;
  name: string;
  expenseGroupId: string;
  description?: string;
  paymentMode: AdminPaymentMode;
  amount: number;
}

export interface UpdateAdminExpenseRequest {
  expenseDate?: string;
  name?: string;
  expenseGroupId?: string;
  description?: string;
  paymentMode?: AdminPaymentMode;
  amount?: number;
  isActive?: boolean;
  keepAttachments?: string;
}

export interface AdminExpenseListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  expenseGroupId?: string;
  paymentMode?: AdminPaymentMode;
}

export interface AdminExpenseListResponse {
  expenses: AdminExpense[];
  total: number;
  page: number;
  limit: number;
  totalAmount: number;
}
