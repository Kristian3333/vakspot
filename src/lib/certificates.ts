// src/lib/certificates.ts

import { CertificateCategory, CertificateStatus } from '@prisma/client';
import type { ProCertificateWithType, CertificateBadge, VerificationEmailContent } from '@/types/certificates';
import { randomBytes } from 'crypto';

/**
 * Get the client-facing label for a certificate
 * Handles special cases like BHV hours and MBO levels
 */
export function getCertificateClientLabel(certCode: string, requiredHours?: number): string {
  // Map of certificate codes to client-friendly labels
  const labelMap: Record<string, string> = {
    VCA: 'VCA-gecertificeerd',
    BHV: requiredHours ? `BHV (${requiredHours} uur)` : 'BHV',
    NEN_1010: 'NEN 1010 (Elektrotechniek)',
    NEN_3140: 'NEN 3140 (Bedrijfsvoering)',
    INSTALLQ: 'InstallQ erkend',
    UNETO_VNI: 'Uneto-VNI gecertificeerd',
    MBO_1: 'MBO Niveau 1',
    MBO_2: 'MBO Niveau 2',
    MBO_3: 'MBO Niveau 3',
    MBO_4: 'MBO Niveau 4',
    HBO: 'HBO diploma',
    ASBEST_INVENTARISATIE: 'Asbest Inventarisatie',
    ASBEST_SANERING: 'Asbest Sanering',
    VIL: 'VIL gecertificeerd',
  };

  return labelMap[certCode] || certCode;
}

/**
 * Format a certificate for display as a badge
 * Returns label, color, and icon based on status and category
 */
export function formatCertificateBadge(cert: ProCertificateWithType): CertificateBadge {
  const baseLabel = cert.certificateType.clientLabel || getCertificateClientLabel(cert.certificateType.code, cert.certificateType.requiredHours || undefined);

  // Determine icon based on category (for verified certs)
  let icon = 'ShieldCheck';
  if (cert.status === CertificateStatus.VERIFIED) {
    switch (cert.certificateType.category) {
      case CertificateCategory.SAFETY:
        icon = 'ShieldCheck';
        break;
      case CertificateCategory.ELECTRICAL:
        icon = 'Zap';
        break;
      case CertificateCategory.INSTALLATION:
        icon = 'Wrench';
        break;
      case CertificateCategory.EDUCATION:
        icon = 'GraduationCap';
        break;
      case CertificateCategory.CONSTRUCTION:
        icon = 'HardHat';
        break;
      case CertificateCategory.GENERAL:
        icon = 'Award';
        break;
    }
  }

  // Determine label, color, and icon based on status
  switch (cert.status) {
    case CertificateStatus.VERIFIED:
      return {
        label: baseLabel,
        color: 'green',
        icon,
      };

    case CertificateStatus.PENDING:
      return {
        label: `${baseLabel} (in behandeling)`,
        color: 'yellow',
        icon: 'Clock',
      };

    case CertificateStatus.EXPIRED:
      return {
        label: `${baseLabel} (verlopen)`,
        color: 'red',
        icon: 'AlertCircle',
      };

    case CertificateStatus.REJECTED:
      return {
        label: `${baseLabel} (afgekeurd)`,
        color: 'gray',
        icon: 'XCircle',
      };

    default:
      return {
        label: baseLabel,
        color: 'gray',
        icon: 'HelpCircle',
      };
  }
}

/**
 * Check if a certificate is expired
 */
export function isCertificateExpired(cert: ProCertificateWithType): boolean {
  if (!cert.expiresAt) {
    return false; // No expiration date = never expires
  }

  const now = new Date();
  return cert.expiresAt < now;
}

/**
 * Generate a cryptographically secure verification token
 */
export function generateVerificationToken(): string {
  // Generate 32 random bytes and convert to URL-safe base64
  return randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Get email content for certificate verification
 */
export function getVerificationEmailContent(
  proName: string,
  certName: string,
  token: string
): VerificationEmailContent {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/certificates/verify?token=${token}`;

  const subject = `VakSpot: Verifieer certificaat voor ${proName}`;

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificaat Verificatie</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin-top: 0;">VakSpot Certificaat Verificatie</h1>

    <p>Beste certificerings-instantie,</p>

    <p><strong>${proName}</strong> heeft aangegeven dat zij/hij het volgende certificaat bezit:</p>

    <div style="background-color: white; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
      <strong>${certName}</strong>
    </div>

    <p>Om dit certificaat te verifiëren, klikt u op de onderstaande knop:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}"
         style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Verifieer Certificaat
      </a>
    </div>

    <p style="font-size: 12px; color: #666;">
      Of kopieer deze link naar uw browser:<br>
      <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 12px; color: #666;">
      Deze verificatie-aanvraag is automatisch gegenereerd door VakSpot.
      Als u deze mail niet verwacht heeft, kunt u deze veilig negeren.
    </p>

    <p style="font-size: 12px; color: #666;">
      Met vriendelijke groet,<br>
      Het VakSpot Team
    </p>
  </div>

  <div style="text-align: center; font-size: 12px; color: #999;">
    <p>&copy; ${new Date().getFullYear()} VakSpot. Alle rechten voorbehouden.</p>
  </div>
</body>
</html>
  `.trim();

  return {
    subject,
    html,
  };
}
