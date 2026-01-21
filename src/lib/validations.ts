// src/lib/validations.ts
import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
});

export const registerClientSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postcode: z.string().regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, 'Ongeldige postcode').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

export const registerProSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  companyName: z.string().min(2, 'Bedrijfsnaam moet minimaal 2 tekens zijn'),
  kvkNumber: z.string().regex(/^[0-9]{8}$/, 'KVK nummer moet 8 cijfers zijn').optional().or(z.literal('')),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  city: z.string().min(2, 'Stad is verplicht'),
  postcode: z.string().regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, 'Ongeldige postcode'),
  categories: z.array(z.string()).min(1, 'Selecteer minimaal één categorie'),
  serviceRadius: z.number().min(5).max(100).default(25),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

// ============================================
// JOB SCHEMAS
// ============================================

// Base schema without refinements (for .partial() support)
const jobSchemaBase = z.object({
  title: z.string().min(5, 'Titel moet minimaal 5 tekens zijn').max(100, 'Titel mag maximaal 100 tekens zijn'),
  description: z.string().min(20, 'Beschrijving moet minimaal 20 tekens zijn').max(2000, 'Beschrijving mag maximaal 2000 tekens zijn'),
  categoryId: z.string().min(1, 'Selecteer een categorie'),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  budgetType: z.enum(['FIXED', 'ESTIMATE', 'HOURLY', 'TO_DISCUSS']).default('ESTIMATE'),
  locationCity: z.string().min(2, 'Stad is verplicht'),
  locationPostcode: z.string().regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, 'Ongeldige postcode'),
  locationAddress: z.string().optional().or(z.literal('')),
  timeline: z.enum(['URGENT', 'THIS_WEEK', 'THIS_MONTH', 'NEXT_MONTH', 'FLEXIBLE']).default('FLEXIBLE'),
  startDate: z.date().optional(),
  images: z.array(z.string()).optional(),
});

// Full create schema with refinements
export const createJobSchema = jobSchemaBase.refine((data) => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Maximum budget moet hoger zijn dan minimum',
  path: ['budgetMax'],
});

// Partial schema for updates (uses base without refinements)
export const updateJobSchema = jobSchemaBase.partial();

// ============================================
// BID SCHEMAS
// ============================================

export const createBidSchema = z.object({
  jobId: z.string().min(1),
  amount: z.number().min(100, 'Minimaal €1').max(10000000, 'Maximum €100.000'),
  amountType: z.enum(['FIXED', 'ESTIMATE', 'HOURLY', 'TO_DISCUSS']).default('ESTIMATE'),
  message: z.string().min(20, 'Bericht moet minimaal 20 tekens zijn').max(1000, 'Bericht mag maximaal 1000 tekens zijn'),
});

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, 'Bericht mag niet leeg zijn').max(2000, 'Bericht mag maximaal 2000 tekens zijn'),
});

// ============================================
// REVIEW SCHEMAS
// ============================================

export const createReviewSchema = z.object({
  jobId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional().or(z.literal('')),
  content: z.string().min(10, 'Review moet minimaal 10 tekens zijn').max(1000, 'Review mag maximaal 1000 tekens zijn'),
  qualityRating: z.number().min(1).max(5).optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  timelinessRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
});

export const reviewResponseSchema = z.object({
  reviewId: z.string().min(1),
  response: z.string().min(10, 'Reactie moet minimaal 10 tekens zijn').max(500, 'Reactie mag maximaal 500 tekens zijn'),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateClientProfileSchema = z.object({
  name: z.string().min(2).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postcode: z.string().regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, 'Ongeldige postcode').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export const updateProProfileSchema = z.object({
  companyName: z.string().min(2).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  phone: z.string().min(10).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  serviceRadius: z.number().min(5).max(100).optional(),
  categories: z.array(z.string()).min(1).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type RegisterProInput = z.infer<typeof registerProSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateBidInput = z.infer<typeof createBidSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>;
export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>;
export type UpdateProProfileInput = z.infer<typeof updateProProfileSchema>;
