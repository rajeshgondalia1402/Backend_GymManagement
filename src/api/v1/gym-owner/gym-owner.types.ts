export interface Trainer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  gender?: string;
  dateOfBirth?: Date;
  joiningDate?: Date;
  salary?: number;
  password?: string;
  trainerPhoto?: string;
  idProofType?: string;
  idProofDocument?: string;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateTrainerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialization?: string;
  experience?: number;
  gender?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  salary?: number;
  idProofType?: string;
}

export interface UpdateTrainerRequest {
  firstName?: string;
  lastName?: string;
  password?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  gender?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  salary?: number;
  idProofType?: string;
  isActive?: boolean;
}


export interface Member {
  id: string;
  memberId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  altContactNo?: string;
  address?: string;
  gender?: string;
  occupation?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  dateOfBirth?: Date;
  anniversaryDate?: Date;
  emergencyContact?: string;
  healthNotes?: string;
  idProofType?: string;
  idProofDocument?: string;
  memberPhoto?: string;
  smsFacility?: boolean;
  isActive: boolean;
  gymId: string;
  trainerId?: string;
  trainer?: Trainer;
  memberType: 'REGULAR' | 'PT' | 'REGULAR_PT';
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  coursePackageId?: string;
  packageFees?: number;
  maxDiscount?: number;
  afterDiscount?: number;
  extraDiscount?: number;
  finalFees?: number;
  // PT Addon Fields
  hasPTAddon?: boolean;
  ptPackageName?: string;
  ptPackageFees?: number;
  ptMaxDiscount?: number;
  ptAfterDiscount?: number;
  ptExtraDiscount?: number;
  ptFinalFees?: number;
  // PT Session Info (from PTMember if exists)
  ptInfo?: {
    trainerId: string;
    trainerName: string;
    sessionsTotal: number;
    sessionsUsed: number;
    sessionsRemaining: number;
    sessionDuration: number;
    startDate: Date;
    endDate?: Date;
    goals?: string;
  };
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  altContactNo?: string;
  address?: string;
  gender?: string;
  occupation?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  anniversaryDate?: string;
  emergencyContact?: string;
  healthNotes?: string;
  idProofType?: string;
  smsFacility?: boolean;
  trainerId?: string;
  memberType?: 'REGULAR' | 'PT' | 'REGULAR_PT';
  membershipStartDate?: string;
  membershipEndDate?: string;
  coursePackageId?: string;
  packageFees?: number;
  maxDiscount?: number;
  afterDiscount?: number;
  extraDiscount?: number;
  finalFees?: number;
  // PT Addon Fields (for REGULAR_PT type)
  hasPTAddon?: boolean;
  ptPackageName?: string;
  ptTrainerId?: string;
  ptSessionsTotal?: number;
  ptSessionDuration?: number;
  ptPackageFees?: number;
  ptMaxDiscount?: number;
  ptExtraDiscount?: number;
  ptFinalFees?: number;
  ptStartDate?: string;
  ptEndDate?: string;
  ptGoals?: string;
  ptNotes?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  altContactNo?: string;
  address?: string;
  gender?: string;
  occupation?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  anniversaryDate?: string;
  emergencyContact?: string;
  healthNotes?: string;
  idProofType?: string;
  smsFacility?: boolean;
  isActive?: boolean;
  trainerId?: string;
  memberType?: 'REGULAR' | 'PT' | 'REGULAR_PT';
  membershipStartDate?: string;
  membershipEndDate?: string;
  coursePackageId?: string;
  packageFees?: number;
  maxDiscount?: number;
  afterDiscount?: number;
  extraDiscount?: number;
  finalFees?: number;
  // PT Addon Fields
  hasPTAddon?: boolean;
  ptPackageName?: string;
  ptPackageFees?: number;
  ptMaxDiscount?: number;
  ptExtraDiscount?: number;
  ptFinalFees?: number;
}

// PT Member Types
export interface PTMember {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  trainerId: string;
  trainerName: string;
  packageName: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  sessionDuration: number;
  startDate: Date;
  endDate?: Date;
  goals?: string;
  notes?: string;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreatePTMemberRequest {
  memberId: string;
  trainerId: string;
  packageName: string;
  sessionsTotal: number;
  sessionDuration?: number;
  startDate?: string;
  endDate?: string;
  goals?: string;
  notes?: string;
}

export interface UpdatePTMemberRequest {
  trainerId?: string;
  packageName?: string;
  sessionsTotal?: number;
  sessionsUsed?: number;
  sessionDuration?: number;
  endDate?: string;
  goals?: string;
  notes?: string;
  isActive?: boolean;
}

// =============================================
// PT Addon & Payment Type Conversion Types
// =============================================

// Payment type - distinguishes between Regular and PT fee payments
export type PaymentFor = 'REGULAR' | 'PT';

// PT session handling options when removing PT
export type PTRemovalAction = 'COMPLETE' | 'FORFEIT' | 'CARRY_FORWARD';

// Add PT addon to existing member request
export interface AddPTAddonRequest {
  ptPackageName: string;
  trainerId: string;
  ptPackageFees: number;
  ptMaxDiscount?: number;
  ptExtraDiscount?: number;
  ptFinalFees: number;
  initialPayment?: number;
  paymentMode?: string;
  startDate?: string;
  endDate?: string;
  goals?: string;
  notes?: string;
}

// Update PT addon request (all fields optional for partial updates)
export interface UpdatePTAddonRequest {
  ptPackageName?: string;
  trainerId?: string;
  ptPackageFees?: number;
  ptMaxDiscount?: number;
  ptExtraDiscount?: number;
  ptFinalFees?: number;
  startDate?: string;
  endDate?: string;
  goals?: string;
  notes?: string;
}

// Remove PT addon request
export interface RemovePTAddonRequest {
  action: PTRemovalAction; // COMPLETE, FORFEIT, CARRY_FORWARD
  notes?: string;
}

// PT Session Credit - for carrying forward unused sessions
export interface PTSessionCredit {
  id: string;
  memberId: string;
  memberName?: string;
  sessionCredits: number;
  usedCredits: number;
  remainingCredits: number;
  originalPackage: string;
  creditDate: Date;
  expiryDate: Date;
  reason?: string;
  notes?: string;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
}

// Combined payment summary for Regular + PT fees
export interface MemberPaymentSummary {
  memberId: string;
  memberName: string;

  // Regular fees summary
  regular: {
    finalFees: number;
    totalPaid: number;
    pendingAmount: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
    paymentCount: number;
  };

  // PT fees summary (if applicable)
  pt?: {
    finalFees: number;
    totalPaid: number;
    pendingAmount: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
    paymentCount: number;
  };

  // Combined totals
  grandTotal: number;
  totalPaid: number;
  totalPending: number;
}

// Supplement Types
export interface Supplement {
  id: string;
  ptMemberId: string;
  memberName?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  notes?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateSupplementRequest {
  name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSupplementRequest {
  name?: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  notes?: string;
  endDate?: string;
  isActive?: boolean;
}

// Member Diet Plan Types (per member)
export interface MemberDietPlan {
  id: string;
  memberId: string;
  memberName?: string;
  planName: string;
  description?: string;
  calories?: number;
  meals: any;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMemberDietPlanRequest {
  planName: string;
  description?: string;
  calories?: number;
  meals: any;
  startDate?: string;
  endDate?: string;
}

export interface UpdateMemberDietPlanRequest {
  planName?: string;
  description?: string;
  calories?: number;
  meals?: any;
  endDate?: string;
  isActive?: boolean;
}

// Inquiry Types
export interface Inquiry {
  id: string;
  name: string;
  email?: string;
  phone: string;
  source: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
  interest?: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED' | 'FOLLOW_UP';
  followUpDate?: Date;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateInquiryRequest {
  name: string;
  email?: string;
  phone: string;
  source?: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
  interest?: string;
  notes?: string;
  followUpDate?: string;
}

export interface UpdateInquiryRequest {
  name?: string;
  email?: string;
  phone?: string;
  source?: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
  interest?: string;
  notes?: string;
  status?: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED' | 'FOLLOW_UP';
  followUpDate?: string;
}

export interface DietPlan {
  id: string;
  name: string;
  description?: string;
  meals?: any[];
  totalCalories?: number;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
}

export interface CreateDietPlanRequest {
  name: string;
  description?: string;
  meals?: any[];
  totalCalories?: number;
  isActive?: boolean;
}

export interface UpdateDietPlanRequest extends Partial<CreateDietPlanRequest> { }

export interface ExercisePlan {
  id: string;
  name: string;
  description?: string;
  exercises?: any[];
  durationMinutes?: number;
  difficulty?: string;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
}

export interface CreateExercisePlanRequest {
  name: string;
  description?: string;
  exercises?: any[];
  durationMinutes?: number;
  difficulty?: string;
  isActive?: boolean;
}

export interface UpdateExercisePlanRequest extends Partial<CreateExercisePlanRequest> { }

export interface AssignPlanRequest {
  memberId: string;
  planId: string;
  startDate?: string;
  endDate?: string;
}

export interface GymOwnerDashboardStats {
  totalMembers: number;
  totalTrainers: number;
  activeMembers: number;
  expiringMemberships: number;
  totalDietPlans: number;
  totalExercisePlans: number;
  totalPTMembers: number;
  totalInquiries: number;
  newInquiries: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  memberType?: 'REGULAR' | 'PT';
  status?: string;
  isActive?: boolean;
  // Member-specific filters
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  smsFacility?: boolean;
  // Date range filters
  membershipStartFrom?: string;
  membershipStartTo?: string;
  membershipEndFrom?: string;
  membershipEndTo?: string;
  // Course package filter
  coursePackageId?: string;
  // Course package type filter
  coursePackageType?: 'REGULAR' | 'PT';
}

// Report Types
export interface MemberReport {
  totalMembers: number;
  activeMembers: number;
  regularMembers: number;
  ptMembers: number;
  newMembersThisMonth: number;
  expiringThisWeek: number;
  membersByMonth: { month: string; count: number }[];
}

export interface PTProgressReport {
  totalPTMembers: number;
  activePTMembers: number;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  completionRate: number;
  ptMembersByTrainer: { trainerName: string; count: number }[];
}

export interface TrainerReport {
  totalTrainers: number;
  activeTrainers: number;
  trainersWithPTMembers: number;
  trainerWorkload: { trainerName: string; ptMembers: number; totalSessions: number }[];
}

export interface RevenueReport {
  totalMembers: number;
  ptMembers: number;
  regularMembers: number;
  membershipsByStatus: { status: string; count: number }[];
  inquiriesConversionRate: number;
}

// Expense Group Master Types
export interface ExpenseGroup {
  id: string;
  expenseGroupName: string;
  gymId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseGroupRequest {
  expenseGroupName: string;
}

export interface UpdateExpenseGroupRequest {
  expenseGroupName: string;
}

// =============================================
// Expense Management Types
// =============================================

export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'NET_BANKING' | 'OTHER';

export interface Expense {
  id: string;
  expenseDate: Date;
  name: string;
  expenseGroupId: string;
  expenseGroupName?: string;
  description?: string;
  paymentMode: PaymentMode;
  amount: number;
  attachments?: string[]; // Array of file paths
  createdBy: string;
  gymId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseRequest {
  expenseDate?: string; // ISO date string
  name: string;
  expenseGroupId: string;
  description?: string;
  paymentMode: PaymentMode;
  amount: number;
  // attachments will be uploaded via multipart/form-data (req.files)
}

export interface UpdateExpenseRequest {
  expenseDate?: string; // ISO date string
  name?: string;
  expenseGroupId?: string;
  description?: string;
  paymentMode?: PaymentMode;
  amount?: number;
  isActive?: boolean;
  // attachments will be uploaded via multipart/form-data (req.files)
  // existing attachments to keep (comma-separated paths or array)
  keepAttachments?: string;
}

export interface ExpenseListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Filters
  year?: number;
  dateFrom?: string; // Date string (YYYY-MM-DD or ISO)
  dateTo?: string; // Date string (YYYY-MM-DD or ISO)
  expenseGroupId?: string;
  paymentMode?: PaymentMode;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalAmount: number; // Sum of all expenses matching the filter
}

// Designation Master Types
export interface Designation {
  id: string;
  designationName: string;
  gymId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDesignationRequest {
  designationName: string;
}

export interface UpdateDesignationRequest {
  designationName: string;
}

// Body Part Master Types
export interface BodyPart {
  id: string;
  bodyPartName: string;
  description?: string | null;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  updatedAt: Date;
  exercises?: WorkoutExercise[];
}

export interface CreateBodyPartRequest {
  bodyPartName: string;
  description?: string;
}

export interface UpdateBodyPartRequest {
  bodyPartName?: string;
  description?: string;
  isActive?: boolean;
}

// Workout Exercise Master Types
export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  shortCode?: string | null;
  description?: string | null;
  isActive: boolean;
  gymId: string;
  bodyPartId?: string | null;
  bodyPartName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutExerciseRequest {
  bodyPartId: string;
  exerciseName: string;
  shortCode?: string;
  description?: string;
}

export interface UpdateWorkoutExerciseRequest {
  bodyPartId?: string;
  exerciseName?: string;
  shortCode?: string;
  description?: string;
  isActive?: boolean;
}

// Member Inquiry Types
export interface MemberInquiry {
  id: string;
  fullName: string;
  contactNo: string;
  inquiryDate: Date;
  dob?: Date;
  followUp: boolean;
  followUpDate?: Date;
  gender?: string;
  address?: string;
  heardAbout?: string;
  userId: string;
  userName?: string;
  comments?: string;
  memberPhoto?: string;
  height?: number;
  weight?: number;
  referenceName?: string;
  gymId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMemberInquiryRequest {
  fullName: string;
  contactNo: string;
  inquiryDate?: string;
  dob?: string;
  followUp?: boolean;
  followUpDate?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  heardAbout?: string;
  comments?: string;
  memberPhoto?: string;
  height?: number;
  weight?: number;
  referenceName?: string;
}

export interface UpdateMemberInquiryRequest {
  fullName?: string;
  contactNo?: string;
  inquiryDate?: string;
  dob?: string;
  followUp?: boolean;
  followUpDate?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  heardAbout?: string;
  comments?: string;
  memberPhoto?: string;
  height?: number;
  weight?: number;
  referenceName?: string;
  isActive?: boolean;
}

// Course Package Types
export type CoursePackageType = 'REGULAR' | 'PT';

export interface CoursePackage {
  id: string;
  packageName: string;
  description?: string;
  fees: number;
  maxDiscount?: number;
  discountType: 'PERCENTAGE' | 'AMOUNT';
  coursePackageType: CoursePackageType;
  Months: number;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCoursePackageRequest {
  packageName: string;
  description?: string;
  fees: number;
  maxDiscount?: number;
  discountType?: 'PERCENTAGE' | 'AMOUNT';
  coursePackageType?: CoursePackageType;
  Months: number;
  months?: number; // Alternative lowercase version
}

export interface UpdateCoursePackageRequest {
  packageName?: string;
  description?: string;
  fees?: number;
  maxDiscount?: number;
  discountType?: 'PERCENTAGE' | 'AMOUNT';
  coursePackageType?: CoursePackageType;
  Months?: number;
  months?: number; // Alternative lowercase version
  isActive?: boolean;
}

// Member Balance Payment Types
export interface MemberBalancePayment {
  id: string;
  receiptNo: string;
  memberId: string;
  memberName?: string;
  paymentFor: PaymentFor; // REGULAR or PT
  paymentDate: Date;
  contactNo?: string;
  paidFees: number;
  payMode: string;
  nextPaymentDate?: Date;
  notes?: string;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMemberBalancePaymentRequest {
  paymentFor?: PaymentFor; // REGULAR or PT - defaults to REGULAR
  paymentDate?: string;
  contactNo?: string;
  paidFees: number;
  payMode: string;
  nextPaymentDate?: string;
  notes?: string;
}

export interface UpdateMemberBalancePaymentRequest {
  paymentDate?: string;
  contactNo?: string;
  paidFees?: number;
  payMode?: string;
  nextPaymentDate?: string;
  notes?: string;
  isActive?: boolean;
}

// Summary of member payments - used for tracking paid vs pending
export interface MemberBalancePaymentSummary {
  memberId: string;
  memberName: string;
  finalFees: number;
  totalPaid: number;
  pendingAmount: number;
  paymentCount: number;
}

// Response with summary and payments list
export interface MemberBalancePaymentResponse {
  summary: MemberBalancePaymentSummary;
  payments: MemberBalancePayment[];
}

// =============================================
// Membership Renewal Types
// =============================================

export type RenewalType = 'STANDARD' | 'EARLY' | 'LATE' | 'UPGRADE' | 'DOWNGRADE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';

export interface MembershipRenewal {
  id: string;
  renewalNumber: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  gymId: string;

  // Previous membership dates
  previousMembershipStart: Date;
  previousMembershipEnd: Date;

  // New membership dates
  newMembershipStart: Date;
  newMembershipEnd: Date;

  // Renewal details
  renewalDate: Date;
  renewalType: RenewalType;

  // Package and fees
  coursePackageId?: string;
  coursePackageName?: string;
  packageFees?: number;
  maxDiscount?: number;
  afterDiscount?: number;
  extraDiscount?: number;
  finalFees?: number;

  // Payment info
  paymentStatus: PaymentStatus;
  paymentMode?: string;
  paidAmount?: number;
  pendingAmount?: number;

  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMembershipRenewalRequest {
  memberId: string;

  // New membership dates (required)
  newMembershipStart: string; // ISO date string
  newMembershipEnd: string;   // ISO date string

  // Renewal type
  renewalType?: RenewalType;

  // Package and fees
  coursePackageId?: string;
  packageFees?: number;
  maxDiscount?: number;
  afterDiscount?: number;
  extraDiscount?: number;
  finalFees?: number;

  // Payment info
  paymentMode?: string;
  paidAmount?: number;

  notes?: string;
}

export interface UpdateMembershipRenewalRequest {
  // Payment info (most common update)
  paymentStatus?: PaymentStatus;
  paymentMode?: string;
  paidAmount?: number;

  // Can also update notes
  notes?: string;
  isActive?: boolean;
}

// Response for member renewals with summary
export interface MemberRenewalHistory {
  member: {
    id: string;
    memberId?: string;
    name: string;
    email: string;
    phone?: string;
    currentMembershipStart?: Date;
    currentMembershipEnd?: Date;
    memberStatus: 'Active' | 'Expired' | 'InActive';
  };
  totalRenewals: number;
  renewals: MembershipRenewal[];
}

// Renewal Rate Report Types
export interface RenewalRateReport {
  // Summary stats
  totalMembers: number;
  totalActiveMembers: number;
  totalExpiredMembers: number;
  totalRenewals: number;
  renewalRate: number; // Percentage of members who renewed

  // Renewal breakdown
  renewalsByType: {
    type: RenewalType;
    count: number;
    percentage: number;
  }[];

  // Payment status breakdown
  renewalsByPaymentStatus: {
    status: PaymentStatus;
    count: number;
    totalAmount: number;
  }[];

  // Monthly renewal trends (last 12 months)
  monthlyRenewals: {
    month: string; // YYYY-MM format
    renewalCount: number;
    newMemberCount: number;
    expiredCount: number;
    renewalRate: number;
  }[];

  // Revenue from renewals
  totalRenewalRevenue: number;
  averageRenewalFees: number;

  // Package popularity in renewals
  packageRenewalStats: {
    packageId: string;
    packageName: string;
    renewalCount: number;
    totalRevenue: number;
  }[];
}

// =============================================
// Member Membership Details Types
// =============================================

export interface RegularMembershipDetails {
  packageFees: number;
  maxDiscount: number;
  afterDiscount: number;
  extraDiscount: number;
  finalFees: number;
  totalPaidFees: number;
  totalPendingFees: number;
  coursePackageId?: string;
  coursePackageName?: string;
  membershipStart: Date;
  membershipEnd: Date;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface PTMembershipDetails {
  packageFees: number;
  maxDiscount: number;
  afterDiscount: number;
  extraDiscount: number;
  finalFees: number;
  totalPaidFees: number;
  totalPendingFees: number;
  packageName: string;
  trainerId: string;
  trainerName: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  sessionDuration: number;
  startDate: Date;
  endDate?: Date;
  goals?: string;
}

export interface MemberMembershipDetailsResponse {
  hasRegularMembership: boolean;
  hasPTMembership: boolean;
  regularMembershipDetails?: RegularMembershipDetails;
  ptMembershipDetails?: PTMembershipDetails;
}

// =============================================
// Diet Template Types
// =============================================

export interface DietMeal {
  id?: string;
  mealNo: number;       // 1-6 (Meal 1 to Meal 6)
  title: string;        // e.g., "Breakfast", "Mid-Morning Snack", "Lunch", etc.
  description: string;  // What to eat
  time: string;         // e.g., "07:30 AM"
}

export interface AssignedMemberInfo {
  memberDietId: string;
  memberId: string;
  memberCode: string | null;
  memberName: string;
  mobileNo: string | null;
  memberType: string;
  hasPTAddon: boolean;
  startDate: Date;
  endDate: Date | null;
}

export interface DietTemplate {
  id: string;
  name: string;
  description?: string;
  gymId: string;
  createdBy: string;
  creatorName?: string;
  isActive: boolean;
  mealsPerDay?: number; // Number of meals in the template
  meals: DietMeal[];
  assignedMembers?: AssignedMemberInfo[];
  assignedMemberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDietTemplateRequest {
  name: string;
  description?: string;
  meals: {
    mealNo: number;
    title: string;
    description: string;
    time: string;
  }[];
}

export interface UpdateDietTemplateRequest {
  name?: string;
  description?: string;
  meals?: {
    mealNo: number;
    title: string;
    description: string;
    time: string;
  }[];
}

// =============================================
// Member Diet Types
// =============================================

export interface MemberDietMeal {
  id?: string;
  mealNo: number;
  title: string;
  description: string;
  time: string;
}

export interface MemberDiet {
  id: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  dietTemplateId: string;
  dietTemplateName?: string;
  gymId: string;
  startDate: Date;
  endDate?: Date;
  assignedBy: string;
  assignerName?: string;
  isActive: boolean;
  notes?: string;
  meals: MemberDietMeal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemberDietRequest {
  memberIds: string[];
  dietTemplateId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  customMeals?: {
    mealNo: number;
    title: string;
    description: string;
    time: string;
  }[];
}

export interface UpdateMemberDietRequest {
  startDate?: string;
  endDate?: string;
  notes?: string;
  meals?: {
    mealNo: number;
    title: string;
    description: string;
    time: string;
  }[];
}

// =============================================
// Trainer Salary Settlement Types
// =============================================

export type IncentiveType = 'PT' | 'PROTEIN' | 'MEMBER_REFERENCE' | 'OTHERS';

// Trainer dropdown response for salary settlement
export interface TrainerDropdownItem {
  trainerId: string;
  name: string;
  mobileNumber?: string;
  joiningDate?: Date;
  monthlySalary?: number;
}

// Salary calculation request
export interface SalaryCalculationRequest {
  trainerId: string;
  salaryMonth: string; // YYYY-MM format
  presentDays: number;
  discountDays?: number;
  incentiveAmount?: number;
  incentiveType?: IncentiveType;
}

// Salary calculation response
export interface SalaryCalculationResponse {
  trainerId: string;
  trainerName: string;
  mobileNumber?: string;
  joiningDate?: Date;
  monthlySalary: number;
  salaryMonth: string;
  totalDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  discountDays: number;
  payableDays: number;
  calculatedSalary: number;
  incentiveAmount: number;
  incentiveType?: IncentiveType;
  finalPayableAmount: number;
}

// Trainer salary settlement record
export interface TrainerSalarySettlement {
  id: string;
  trainerId: string;
  trainerName: string;
  mobileNumber?: string;
  joiningDate?: Date;
  monthlySalary: number;
  salaryMonth: string;
  salarySentDate?: Date;
  totalDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  discountDays: number;
  payableDays: number;
  calculatedSalary: number;
  incentiveAmount: number;
  incentiveType?: IncentiveType;
  paymentMode: PaymentMode;
  finalPayableAmount: number;
  remarks?: string;
  gymId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create salary settlement request
export interface CreateSalarySettlementRequest {
  trainerId: string;
  salaryMonth: string; // YYYY-MM format
  salarySentDate?: string; // ISO date string
  presentDays: number;
  discountDays?: number;
  incentiveAmount?: number;
  incentiveType?: IncentiveType;
  paymentMode: PaymentMode;
  remarks?: string;
}

// Update salary settlement request
export interface UpdateSalarySettlementRequest {
  salarySentDate?: string;
  presentDays?: number;
  discountDays?: number;
  incentiveAmount?: number;
  incentiveType?: IncentiveType;
  paymentMode?: PaymentMode;
  remarks?: string;
}

// Salary settlement list params
export interface SalarySettlementListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Filters
  trainerId?: string;
  paymentMode?: PaymentMode;
  fromDate?: string; // Date string (YYYY-MM-DD or ISO)
  toDate?: string; // Date string (YYYY-MM-DD or ISO)
}

// Salary settlement list response
export interface SalarySettlementListResponse {
  settlements: TrainerSalarySettlement[];
  total: number;
  page: number;
  limit: number;
  totalAmount: number; // Sum of all settlements matching the filter
}

// =============================================
// Trainer Salary Slip Types
// =============================================

// Gym details for salary slip header
export interface SalarySlipGymDetails {
  gymId: string;
  gymName: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  fullAddress: string; // Combined address
  mobileNo?: string;
  phoneNo?: string;
  email?: string;
  gstRegNo?: string;
  gymLogo?: string;
}

// Trainer/Employee details for salary slip
export interface SalarySlipTrainerDetails {
  trainerId: string;
  trainerName: string;
  email: string;
  mobileNumber?: string;
  gender?: string;
  designation?: string; // Specialization
  joiningDate?: Date;
  employeeCode?: string; // Trainer ID as employee code
}

// Earnings breakdown
export interface SalarySlipEarnings {
  basicSalary: number; // Monthly salary
  calculatedSalary: number; // Pro-rated based on attendance
  incentiveAmount: number;
  incentiveType?: IncentiveType;
  grossEarnings: number; // calculatedSalary + incentiveAmount
}

// Attendance summary
export interface SalarySlipAttendance {
  totalDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  discountDays: number; // Leave adjustments
  payableDays: number;
  attendancePercentage: number;
}

// Payment details
export interface SalarySlipPaymentDetails {
  paymentMode: PaymentMode;
  paymentDate?: Date;
  transactionRef?: string; // Future scope
}

// Complete Salary Slip
export interface TrainerSalarySlip {
  // Slip metadata
  slipId: string; // Settlement ID
  slipNumber: string; // Formatted slip number
  generatedDate: Date;

  // Period
  salaryMonth: string; // YYYY-MM
  salaryPeriod: string; // e.g., "January 2025"
  periodStartDate: Date;
  periodEndDate: Date;

  // Gym details
  gymDetails: SalarySlipGymDetails;

  // Trainer details
  trainerDetails: SalarySlipTrainerDetails;

  // Attendance
  attendance: SalarySlipAttendance;

  // Earnings
  earnings: SalarySlipEarnings;

  // Deductions (future scope)
  deductions: {
    totalDeductions: number;
    items: { name: string; amount: number }[];
  };

  // Net payable
  netPayableAmount: number;
  netPayableInWords: string;

  // Payment details
  paymentDetails: SalarySlipPaymentDetails;

  // Additional
  remarks?: string;
  createdAt: Date;
}
