export interface MemberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  healthNotes?: string;
  isActive: boolean;
  gymId: string;
  gym?: {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  trainerId?: string;
  trainer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
  };
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  membershipStatus?: string;
  createdAt: Date;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  healthNotes?: string;
}

export interface MemberDashboardStats {
  daysRemaining: number;
  totalWorkouts: number;
  activeDietPlan?: {
    id: string;
    name: string;
  };
  activeExercisePlans: number;
  trainer?: {
    id: string;
    name: string;
    specialization?: string;
  };
}

export interface AssignedDietPlan {
  id: string;
  dietPlan: {
    id: string;
    name: string;
    description?: string;
    meals?: any[];
    totalCalories?: number;
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface AssignedExercisePlan {
  id: string;
  exercisePlan: {
    id: string;
    name: string;
    description?: string;
    exercises?: any[];
    durationMinutes?: number;
    difficulty?: string;
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface Membership {
  startDate?: Date;
  endDate?: Date;
  daysRemaining: number;
  isActive: boolean;
  gym: {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export interface MemberDietPlanListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// Comprehensive Dashboard Types
export interface ComprehensiveDashboard {
  memberInfo: {
    id: string;
    memberId: string;
    name: string;
    email: string;
    phone: string | null;
    memberPhoto: string | null;
    memberType: string;
  };

  membership: {
    packageName: string | null;
    startDate: Date | null;
    endDate: Date | null;
    status: string;
    daysRemaining: number;
    isExpired: boolean;
    expiryStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  };

  fees: {
    totalFees: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  };

  nextPayment: {
    date: Date | null;
    isToday: boolean;
    isPastDue: boolean;
    daysUntilDue: number | null;
  } | null;

  trainer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
  } | null;

  todayExercise: {
    id: string;
    name: string;
    description: string | null;
    type: string | null;
    exercises: any[];
  } | null;

  dietPlan: {
    id: string;
    name: string;
    description: string | null;
    meals: {
      mealNo: number;
      title: string;
      description: string | null;
      time: string | null;
    }[];
    startDate: Date | null;
    endDate: Date | null;
  } | null;

  gym: {
    id: string;
    name: string;
    address: string | null;
    mobileNo: string | null;
    email: string | null;
  };
}
