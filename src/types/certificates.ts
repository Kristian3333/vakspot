// src/types/certificates.ts

import { CertificateCategory, CertificateStatus } from '@prisma/client';

/**
 * Certificate badge display configuration
 */
export interface CertificateBadge {
  label: string;
  color: string;
  icon: string;
}

/**
 * Certificate type with all fields
 */
export interface CertificateTypeInfo {
  id: string;
  code: string;
  name: string;
  category: CertificateCategory;
  description: string | null;
  clientLabel: string | null;
  requiredHours: number | null;
  validityYears: number | null;
  active: boolean;
  order: number;
}

/**
 * Pro certificate with type information
 */
export interface ProCertificateWithType {
  id: string;
  proId: string;
  status: CertificateStatus;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  issuedAt: Date | null;
  certificateNumber: string | null;
  issuingBody: string | null;
  certificateType: CertificateTypeInfo;
}

/**
 * Email content for verification
 */
export interface VerificationEmailContent {
  subject: string;
  html: string;
}
