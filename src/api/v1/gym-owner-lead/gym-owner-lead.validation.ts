import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otpCode: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  gymName: z.string().min(2, 'Gym name must be at least 2 characters').max(200),
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be at most 15 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required' }),
});

export const checkSessionSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const checkMobileSchema = z.object({
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be at most 15 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});
