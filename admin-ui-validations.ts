// lib/validations.ts

import { z } from 'zod';

export const subscriptionPlanSchema = z.object({
  planName: z.enum([
    'Basic / Entry-Level Plans',
    'Standard / Popular Plans',
    'Premium / Advanced Plans',
    'Duration-Based (Common in India)',
  ], {
    required_error: 'Plan name is required',
  }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description is too long'),
  priceCurrency: z.enum(['INR', 'USD'], {
    required_error: 'Currency is required',
  }),
  priceAmount: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than 0')
    .max(999999, 'Price is too high'),
  durationDays: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Duration must be a number',
    })
    .int('Duration must be a whole number')
    .positive('Duration must be greater than 0')
    .max(3650, 'Duration cannot exceed 10 years'),
  features: z
    .string()
    .min(10, 'Features must be at least 10 characters')
    .max(5000, 'Features list is too long'),
  isActive: z.boolean().default(true),
});

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;
