// src/lib/validations.ts
import { z } from 'zod';

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Dutch postal code regex: 1234 AB (with optional space)
const DUTCH_POSTCODE_REGEX = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

// Format postal code to standard format: "1234 AB"
export function formatDutchPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return postcode;
}

// Validate Dutch postal code
export function isValidDutchPostcode(postcode: string): boolean {
  return DUTCH_POSTCODE_REGEX.test(postcode);
}

// Custom Zod transformer for Dutch postal codes
const dutchPostcodeSchema = z
  .string()
  .min(1, 'Postcode is verplicht')
  .transform((val) => val.replace(/\s/g, '').toUpperCase())
  .refine((val) => /^[1-9][0-9]{3}[A-Za-z]{2}$/.test(val), {
    message: 'Ongeldige postcode (gebruik formaat: 1234 AB)',
  })
  .transform((val) => `${val.slice(0, 4)} ${val.slice(4)}`);

// Optional Dutch postcode (for fields that aren't required)
const optionalDutchPostcodeSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (!val || val === '') return '';
    return val.replace(/\s/g, '').toUpperCase();
  })
  .refine((val) => {
    if (!val || val === '') return true;
    return /^[1-9][0-9]{3}[A-Za-z]{2}$/.test(val);
  }, {
    message: 'Ongeldige postcode (gebruik formaat: 1234 AB)',
  })
  .transform((val) => {
    if (!val || val.length < 6) return val || '';
    return `${val.slice(0, 4)} ${val.slice(4)}`;
  });

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
});

// Server-side schema: confirmPassword is optional since it's validated client-side
export const registerClientSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  confirmPassword: z.string().optional(), // Optional on server - validated client-side
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postcode: optionalDutchPostcodeSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'U moet akkoord gaan met de algemene voorwaarden',
  }).optional(), // Make optional for backward compatibility, enforce in form
  role: z.literal('CLIENT').optional(),
});

// Server-side schema: confirmPassword and postcode are optional
export const registerProSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  confirmPassword: z.string().optional(), // Optional on server - validated client-side
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  companyName: z.string().min(2, 'Bedrijfsnaam moet minimaal 2 tekens zijn'),
  kvkNumber: z.string().regex(/^[0-9]{8}$/, 'KVK nummer moet 8 cijfers zijn').optional().or(z.literal('')),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  city: z.string().min(2, 'Stad is verplicht'),
  postcode: optionalDutchPostcodeSchema,
  categories: z.array(z.string()).min(1, 'Selecteer minimaal één categorie'),
  serviceRadius: z.number().min(5).max(100).default(25),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'U moet akkoord gaan met de algemene voorwaarden',
  }).optional(), // Make optional for backward compatibility, enforce in form
  role: z.literal('PRO').optional(),
});

// ============================================
// JOB SCHEMAS (Simplified)
// ============================================

// Simplified job schema - budget and timeline are optional
export const createJobSchema = z.object({
  title: z.string().min(5, 'Titel moet minimaal 5 tekens zijn').max(100, 'Titel mag maximaal 100 tekens zijn'),
  description: z.string().min(20, 'Beschrijving moet minimaal 20 tekens zijn').max(5000, 'Beschrijving mag maximaal 5000 tekens zijn'),
  categoryId: z.string().min(1, 'Selecteer een categorie'),
  locationCity: z.string().min(2, 'Stad is verplicht'),
  locationPostcode: dutchPostcodeSchema,
  locationAddress: z.string().optional().or(z.literal('')),
  // Optional fields (with defaults applied in API)
  budgetMin: z.number().min(0).optional().nullable(),
  budgetMax: z.number().min(0).optional().nullable(),
  budgetType: z.enum(['FIXED', 'ESTIMATE', 'HOURLY', 'TO_DISCUSS']).optional().default('TO_DISCUSS'),
  timeline: z.enum(['URGENT', 'THIS_WEEK', 'THIS_MONTH', 'NEXT_MONTH', 'FLEXIBLE']).optional().default('FLEXIBLE'),
  startDate: z.date().optional().nullable(),
  images: z.array(z.string()).optional(),
});

// Partial schema for updates
export const updateJobSchema = createJobSchema.partial();

// ============================================
// BID/INTEREST SCHEMAS (Simplified)
// ============================================

// Simplified: PRO expresses interest with just a message
export const createInterestSchema = z.object({
  jobId: z.string().min(1),
  message: z.string().min(10, 'Bericht moet minimaal 10 tekens zijn').max(1000, 'Bericht mag maximaal 1000 tekens zijn'),
});

// Legacy bid schema (for backward compatibility)
export const createBidSchema = z.object({
  jobId: z.string().min(1),
  amount: z.number().min(0).optional().default(0),
  amountType: z.enum(['FIXED', 'ESTIMATE', 'HOURLY', 'TO_DISCUSS']).optional().default('TO_DISCUSS'),
  message: z.string().min(10, 'Bericht moet minimaal 10 tekens zijn').max(1000, 'Bericht mag maximaal 1000 tekens zijn'),
});

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, 'Bericht mag niet leeg zijn').max(2000, 'Bericht mag maximaal 2000 tekens zijn'),
});

// ============================================
// REVIEW SCHEMAS (Simplified)
// ============================================

export const createReviewSchema = z.object({
  jobId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional().or(z.literal('')),
  content: z.string().min(10, 'Review moet minimaal 10 tekens zijn').max(1000, 'Review mag maximaal 1000 tekens zijn'),
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
  postcode: optionalDutchPostcodeSchema,
  address: z.string().optional().or(z.literal('')),
});

export const updateProProfileSchema = z.object({
  companyName: z.string().min(2).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  phone: z.string().min(10).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  serviceRadius: z.number().min(5).max(100).optional(),
  categories: z.array(z.string()).min(1).optional(),
  // Credentials (new)
  credentials: z.string().max(500).optional().or(z.literal('')),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type RegisterProInput = z.infer<typeof registerProSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateInterestInput = z.infer<typeof createInterestSchema>;
export type CreateBidInput = z.infer<typeof createBidSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>;
export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>;
export type UpdateProProfileInput = z.infer<typeof updateProProfileSchema>;
