export interface CreateTrainerVacancyInput {
  gymOwnerLeadEmail: string;
  role: 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_TIME';
  yearsOfExperience?: number;
  ptClientExperience?: number;
  description?: string;
  specialization?: string;
  certificate?: string;
  isPTTrainer?: boolean;
  howSoonCanJoin?: string;
  gender?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: 'PER_MONTH' | 'PER_YEAR';
  country?: string;
  state?: string;
  city?: string;
  closeDate?: string;
}

export interface UpdateTrainerVacancyInput extends Partial<Omit<CreateTrainerVacancyInput, 'gymOwnerLeadEmail'>> {
  status?: 'ACTIVE' | 'CLOSED';
}

export interface TrainerVacancySearchParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  state?: string;
  city?: string;
  isPTTrainer?: string;
  gender?: string;
  salaryType?: string;
  salaryMin?: string;
  salaryMax?: string;
  experienceMin?: string;
  experienceMax?: string;
  specialization?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
