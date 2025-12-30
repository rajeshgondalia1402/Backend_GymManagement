export interface Trainer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
  gymId: string;
  createdAt: Date;
}

export interface CreateTrainerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialization?: string;
}

export interface UpdateTrainerRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
}

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  gymId: string;
  trainerId?: string;
  trainer?: Trainer;
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  createdAt: Date;
}

export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  trainerId?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  trainerId?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
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

export interface UpdateDietPlanRequest extends Partial<CreateDietPlanRequest> {}

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

export interface UpdateExercisePlanRequest extends Partial<CreateExercisePlanRequest> {}

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
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
