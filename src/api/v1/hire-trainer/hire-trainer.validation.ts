import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be at most 15 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otpCode: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

export const checkVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const saveStepSchema = z.object({
  email: z.string().email('Invalid email format'),
  step: z.number().int().min(1).max(2),
  data: z.record(z.any()),
});

export const submitSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resumeSchema = z.object({
  email: z.string().email('Invalid email format'),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be at most 15 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
});

export const searchSchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  city: z.string().optional(),
  role: z.string().optional(),
  experienceMin: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  experienceMax: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  salaryMin: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  salaryMax: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  specialization: z.string().optional(),
  gender: z.string().optional(),
  availability: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
