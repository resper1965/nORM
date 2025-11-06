/**
 * Validation utilities
 * Zod schemas for common validations
 */

import { z } from 'zod';

// UUID validation
export const uuidSchema = z.string().uuid();

// Email validation
export const emailSchema = z.string().email();

// URL validation
export const urlSchema = z.string().url();

// Sentiment score validation (-1.0 to 1.0)
export const sentimentScoreSchema = z.number().min(-1).max(1);

// Confidence score validation (0.0 to 1.0)
export const confidenceScoreSchema = z.number().min(0).max(1);

// Reputation score validation (0 to 100)
export const reputationScoreSchema = z.number().min(0).max(100);

// SEO score validation (0 to 100)
export const seoScoreSchema = z.number().min(0).max(100);

// Client role validation
export const clientRoleSchema = z.enum(['admin', 'editor', 'viewer']);

// Alert severity validation
export const alertSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Social platform validation
export const socialPlatformSchema = z.enum(['instagram', 'linkedin', 'facebook']);

// Content status validation
export const contentStatusSchema = z.enum(['draft', 'published', 'archived']);

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// Date range schema
export const dateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
}).refine((data) => data.end >= data.start, {
  message: 'End date must be after start date',
});
