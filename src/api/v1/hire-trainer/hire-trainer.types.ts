export interface SendOtpInput {
  email: string;
  mobile: string;
}

export interface VerifyOtpInput {
  email: string;
  otpCode: string;
}

export interface SaveStepInput {
  email: string;
  step: number;
  data: Record<string, any>;
}

export interface HireTrainerSearchParams {
  page: number;
  limit: number;
  search?: string;
  city?: string;
  role?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  specialization?: string;
  gender?: string;
  availability?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
