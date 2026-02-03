// =============================================
// Trainer Module Types
// =============================================

// Request Types
export interface GetAssignedMembersRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AssignDietPlanRequest {
  memberId: string;
  dietPlanId: string;
  startDate?: string;
  endDate?: string;
}

export interface AssignExercisePlanRequest {
  memberId: string;
  exercisePlanId: string;
  dayOfWeek?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateDietPlanRequest {
  name: string;
  description?: string;
  calories?: number;
  meals: object;
}

export interface CreateExercisePlanRequest {
  name: string;
  description?: string;
  type?: string;
  exercises: object;
}

export interface UpdateDietPlanRequest {
  name?: string;
  description?: string;
  calories?: number;
  meals?: object;
  isActive?: boolean;
}

export interface UpdateExercisePlanRequest {
  name?: string;
  description?: string;
  type?: string;
  exercises?: object;
  isActive?: boolean;
}

// Response Types
export interface AssignedMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  membershipStatus: string;
  membershipStart: string;
  membershipEnd: string;
  assignedAt: string;
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  calories: number | null;
  meals: object;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExercisePlan {
  id: string;
  name: string;
  description: string;
  type: string | null;
  exercises: object;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDietAssignment {
  id: string;
  memberId: string;
  memberName: string;
  dietPlanId: string;
  dietPlanName: string;
  assignedAt: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface MemberExerciseAssignment {
  id: string;
  memberId: string;
  memberName: string;
  exercisePlanId: string;
  exercisePlanName: string;
  dayOfWeek: number | null;
  assignedAt: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: number | null;
  phone: string;
  gymId: string;
  gymName: string;
  isActive: boolean;
  createdAt: string;
}

export interface TrainerGymDetails {
  id: string;
  name: string;
  logo?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  mobileNo?: string;
  phoneNo?: string;
  email?: string;
}

export interface TrainerProfileDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  specialization?: string;
  experience?: number;
  joiningDate?: string;
  salary?: number;
  trainerPhoto?: string;
  idProofType?: string;
  idProofDocument?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gym: TrainerGymDetails;
}

// =============================================
// Trainer Salary Settlement Types
// =============================================

export type IncentiveType = 'PT' | 'PROTEIN' | 'MEMBER_REFERENCE' | 'OTHERS';
export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'NET_BANKING' | 'OTHER';

export interface TrainerSalarySettlement {
  id: string;
  trainerId: string;
  trainerName: string;
  mobileNumber?: string;
  joiningDate?: string;
  monthlySalary: number;
  salaryMonth: string;
  salarySentDate?: string;
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
  createdAt: string;
}

export interface SalarySettlementListParams {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

export interface SalarySettlementSummary {
  totalSettlements: number;
  totalEarnings: number;
  totalIncentives: number;
}

// =============================================
// Trainer Dashboard Types
// =============================================

export interface PTMemberDietPlan {
  id: string;
  planName: string;
  description?: string;
  calories?: number;
  meals: object;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface CurrentMonthPTMember {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberGender: string;
  packageName: string;
  startDate: string;
  endDate?: string;
  goals?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  dietPlan?: PTMemberDietPlan;
}

export interface TrainerDashboardStats {
  totalSalary: number;
  totalIncentive: number;
  totalAssignedPTMembers: number;
  currentMonthPTMembers: CurrentMonthPTMember[];
}
