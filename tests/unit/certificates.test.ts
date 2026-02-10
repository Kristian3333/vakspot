// tests/unit/certificates.test.ts
import { describe, it, expect } from 'vitest';
import {
  getCertificateClientLabel,
  formatCertificateBadge,
  isCertificateExpired,
  generateVerificationToken,
  getVerificationEmailContent,
} from '@/lib/certificates';
import { CertificateStatus, CertificateCategory } from '@prisma/client';
import type { ProCertificateWithType } from '@/types/certificates';

describe('getCertificateClientLabel', () => {
  it('should return custom client label when provided', () => {
    const result = getCertificateClientLabel('VCA', undefined);
    expect(result).toBe('VCA-gecertificeerd');
  });

  it('should include required hours for BHV', () => {
    const result = getCertificateClientLabel('BHV', 16);
    expect(result).toBe('BHV (16 uur)');
  });

  it('should handle MBO levels', () => {
    const result = getCertificateClientLabel('MBO_2');
    expect(result).toBe('MBO Niveau 2');
  });

  it('should handle MBO levels with spaces', () => {
    const result = getCertificateClientLabel('MBO_4');
    expect(result).toBe('MBO Niveau 4');
  });

  it('should return code as fallback', () => {
    const result = getCertificateClientLabel('UNKNOWN_CERT');
    expect(result).toBe('UNKNOWN_CERT');
  });
});

describe('formatCertificateBadge', () => {
  const createMockCert = (
    status: CertificateStatus,
    category: CertificateCategory,
    expiresAt: Date | null = null
  ): ProCertificateWithType => ({
    id: 'cert-1',
    proId: 'pro-1',
    status,
    verifiedAt: status === CertificateStatus.VERIFIED ? new Date() : null,
    expiresAt,
    issuedAt: new Date(),
    certificateNumber: 'CERT123',
    issuingBody: 'Test Body',
    certificateType: {
      id: 'type-1',
      code: 'VCA',
      name: 'VCA Veiligheid',
      category,
      description: 'Safety certification',
      clientLabel: 'VCA-gecertificeerd',
      requiredHours: null,
      validityYears: 10,
      active: true,
      order: 1,
    },
  });

  it('should return verified badge for verified certificate', () => {
    const cert = createMockCert(CertificateStatus.VERIFIED, CertificateCategory.SAFETY);
    const result = formatCertificateBadge(cert);

    expect(result.label).toBe('VCA-gecertificeerd');
    expect(result.color).toBe('green');
    expect(result.icon).toBe('ShieldCheck');
  });

  it('should return pending badge for pending certificate', () => {
    const cert = createMockCert(CertificateStatus.PENDING, CertificateCategory.SAFETY);
    const result = formatCertificateBadge(cert);

    expect(result.label).toBe('VCA-gecertificeerd (in behandeling)');
    expect(result.color).toBe('yellow');
    expect(result.icon).toBe('Clock');
  });

  it('should return expired badge for expired certificate', () => {
    const cert = createMockCert(CertificateStatus.EXPIRED, CertificateCategory.SAFETY);
    const result = formatCertificateBadge(cert);

    expect(result.label).toBe('VCA-gecertificeerd (verlopen)');
    expect(result.color).toBe('red');
    expect(result.icon).toBe('AlertCircle');
  });

  it('should return rejected badge for rejected certificate', () => {
    const cert = createMockCert(CertificateStatus.REJECTED, CertificateCategory.SAFETY);
    const result = formatCertificateBadge(cert);

    expect(result.label).toBe('VCA-gecertificeerd (afgekeurd)');
    expect(result.color).toBe('gray');
    expect(result.icon).toBe('XCircle');
  });

  it('should use different icon for electrical category', () => {
    const cert = createMockCert(CertificateStatus.VERIFIED, CertificateCategory.ELECTRICAL);
    const result = formatCertificateBadge(cert);

    expect(result.icon).toBe('Zap');
  });

  it('should use different icon for education category', () => {
    const cert = createMockCert(CertificateStatus.VERIFIED, CertificateCategory.EDUCATION);
    const result = formatCertificateBadge(cert);

    expect(result.icon).toBe('GraduationCap');
  });
});

describe('isCertificateExpired', () => {
  const createMockCert = (expiresAt: Date | null): ProCertificateWithType => ({
    id: 'cert-1',
    proId: 'pro-1',
    status: CertificateStatus.VERIFIED,
    verifiedAt: new Date(),
    expiresAt,
    issuedAt: new Date(),
    certificateNumber: 'CERT123',
    issuingBody: 'Test Body',
    certificateType: {
      id: 'type-1',
      code: 'VCA',
      name: 'VCA Veiligheid',
      category: CertificateCategory.SAFETY,
      description: null,
      clientLabel: 'VCA-gecertificeerd',
      requiredHours: null,
      validityYears: 10,
      active: true,
      order: 1,
    },
  });

  it('should return false when expiresAt is null', () => {
    const cert = createMockCert(null);
    expect(isCertificateExpired(cert)).toBe(false);
  });

  it('should return false when expiresAt is in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const cert = createMockCert(futureDate);
    expect(isCertificateExpired(cert)).toBe(false);
  });

  it('should return true when expiresAt is in the past', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    const cert = createMockCert(pastDate);
    expect(isCertificateExpired(cert)).toBe(true);
  });

  it('should return false when expiresAt is today', () => {
    const today = new Date();
    const cert = createMockCert(today);
    expect(isCertificateExpired(cert)).toBe(false);
  });
});

describe('generateVerificationToken', () => {
  it('should generate a token', () => {
    const token = generateVerificationToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should generate a token of reasonable length', () => {
    const token = generateVerificationToken();
    expect(token.length).toBeGreaterThan(20);
  });

  it('should generate unique tokens', () => {
    const token1 = generateVerificationToken();
    const token2 = generateVerificationToken();
    expect(token1).not.toBe(token2);
  });

  it('should generate URL-safe tokens', () => {
    const token = generateVerificationToken();
    // Should only contain alphanumeric characters and hyphens/underscores
    expect(token).toMatch(/^[a-zA-Z0-9_-]+$/);
  });
});

describe('getVerificationEmailContent', () => {
  it('should generate email with correct subject', () => {
    const result = getVerificationEmailContent('Jan Bakker', 'VCA Certificaat', 'test-token-123');
    expect(result.subject).toBe('VakSpot: Verifieer certificaat voor Jan Bakker');
  });

  it('should include PRO name in email body', () => {
    const result = getVerificationEmailContent('Jan Bakker', 'VCA Certificaat', 'test-token-123');
    expect(result.html).toContain('Jan Bakker');
  });

  it('should include certificate name in email body', () => {
    const result = getVerificationEmailContent('Jan Bakker', 'VCA Certificaat', 'test-token-123');
    expect(result.html).toContain('VCA Certificaat');
  });

  it('should include verification token in email body', () => {
    const result = getVerificationEmailContent('Jan Bakker', 'VCA Certificaat', 'test-token-123');
    expect(result.html).toContain('test-token-123');
  });

  it('should include verification link', () => {
    const result = getVerificationEmailContent('Jan Bakker', 'VCA Certificaat', 'test-token-123');
    expect(result.html).toContain('/api/certificates/verify');
    expect(result.html).toContain('token=test-token-123');
  });

  it('should include HTML structure', () => {
    const result = getVerificationEmailContent('Jan Bakker', 'VCA Certificaat', 'test-token-123');
    expect(result.html).toContain('<html');
    expect(result.html).toContain('</html>');
  });
});
