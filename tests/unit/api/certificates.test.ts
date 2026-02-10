// tests/unit/api/certificates.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { CertificateStatus, CertificateCategory } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    certificateType: {
      findMany: vi.fn(),
    },
    proCertificate: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    proProfile: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(() => Promise.resolve(true)),
}));

// Mock certificates lib
vi.mock('@/lib/certificates', () => ({
  generateVerificationToken: vi.fn(() => 'mock-token-123'),
  getVerificationEmailContent: vi.fn(() => ({
    subject: 'Test Subject',
    html: '<html>Test HTML</html>',
  })),
}));

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateVerificationToken, getVerificationEmailContent } from '@/lib/certificates';

// Import route handlers (will be created)
import { GET as getTypes } from '@/app/api/certificates/types/route';
import { GET as getCerts, POST as addCert } from '@/app/api/certificates/route';
import { DELETE as deleteCert } from '@/app/api/certificates/[id]/route';
import { POST as verifyCert } from '@/app/api/certificates/[id]/verify/route';
import { GET as verifyToken } from '@/app/api/certificates/verify-token/route';

describe('GET /api/certificates/types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return certificate types grouped by category', async () => {
    const mockTypes = [
      {
        id: 'type-1',
        code: 'VCA',
        name: 'VCA Veiligheid',
        category: CertificateCategory.SAFETY,
        description: 'Safety cert',
        clientLabel: 'VCA-gecertificeerd',
        requiredHours: null,
        validityYears: 10,
        active: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'type-2',
        code: 'NEN_1010',
        name: 'NEN 1010',
        category: CertificateCategory.ELECTRICAL,
        description: 'Electrical cert',
        clientLabel: 'NEN 1010 gecertificeerd',
        requiredHours: null,
        validityYears: 5,
        active: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.certificateType.findMany).mockResolvedValue(mockTypes as any);

    const request = new NextRequest('http://localhost/api/certificates/types');
    const response = await getTypes(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('types');
    expect(Array.isArray(data.types)).toBe(true);
    expect(data.types.length).toBe(2);
  });

  it('should only return active certificate types', async () => {
    vi.mocked(prisma.certificateType.findMany).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/certificates/types');
    await getTypes(request);

    expect(prisma.certificateType.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
      })
    );
  });
});

describe('GET /api/certificates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/certificates');
    const response = await getCerts(request);

    expect(response.status).toBe(401);
  });

  it('should return 403 if not a PRO', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'CLIENT', email: 'test@example.com', suspended: false },
    } as any);

    const request = new NextRequest('http://localhost/api/certificates');
    const response = await getCerts(request);

    expect(response.status).toBe(403);
  });

  it('should return certificates for authenticated PRO', async () => {
    const mockSession = {
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    };
    (auth as any).mockResolvedValue(mockSession as any);

    const mockProfile = { id: 'pro-1', userId: 'user-1' };
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(mockProfile as any);

    const mockCerts = [
      {
        id: 'cert-1',
        proId: 'pro-1',
        certificateTypeId: 'type-1',
        status: CertificateStatus.VERIFIED,
        verifiedAt: new Date(),
        expiresAt: null,
        issuedAt: new Date(),
        certificateNumber: 'CERT123',
        issuingBody: 'Test Body',
        certificateType: {
          id: 'type-1',
          code: 'VCA',
          name: 'VCA Veiligheid',
          category: CertificateCategory.SAFETY,
        },
      },
    ];
    vi.mocked(prisma.proCertificate.findMany).mockResolvedValue(mockCerts as any);

    const request = new NextRequest('http://localhost/api/certificates');
    const response = await getCerts(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('certificates');
    expect(data.certificates).toHaveLength(1);
    expect(data.certificates[0].id).toBe('cert-1');
  });

  it('should return empty array if PRO has no profile', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/certificates');
    const response = await getCerts(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.certificates).toEqual([]);
  });
});

describe('POST /api/certificates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/certificates', {
      method: 'POST',
      body: JSON.stringify({ certificateTypeId: 'type-1' }),
    });
    const response = await addCert(request);

    expect(response.status).toBe(401);
  });

  it('should return 403 if not a PRO', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'CLIENT', email: 'test@example.com', suspended: false },
    } as any);

    const request = new NextRequest('http://localhost/api/certificates', {
      method: 'POST',
      body: JSON.stringify({ certificateTypeId: 'type-1' }),
    });
    const response = await addCert(request);

    expect(response.status).toBe(403);
  });

  it('should return 400 if validation fails', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue({ id: 'pro-1' } as any);

    const request = new NextRequest('http://localhost/api/certificates', {
      method: 'POST',
      body: JSON.stringify({}), // Missing certificateTypeId
    });
    const response = await addCert(request);

    expect(response.status).toBe(400);
  });

  it('should create certificate with PENDING status', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    const mockProfile = { id: 'pro-1', userId: 'user-1' };
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(mockProfile as any);

    const mockCert = {
      id: 'cert-1',
      proId: 'pro-1',
      certificateTypeId: 'type-1',
      status: CertificateStatus.PENDING,
      certificateNumber: 'CERT123',
      issuingBody: 'Test Body',
      issuedAt: new Date('2024-01-01'),
      certificateType: {
        id: 'type-1',
        code: 'VCA',
        name: 'VCA Veiligheid',
      },
    };
    vi.mocked(prisma.proCertificate.create).mockResolvedValue(mockCert as any);

    const request = new NextRequest('http://localhost/api/certificates', {
      method: 'POST',
      body: JSON.stringify({
        certificateTypeId: 'type-1',
        certificateNumber: 'CERT123',
        issuingBody: 'Test Body',
        issuedAt: '2024-01-01',
      }),
    });
    const response = await addCert(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('certificate');
    expect(data.certificate.status).toBe(CertificateStatus.PENDING);
  });
});

describe('DELETE /api/certificates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const response = await deleteCert(
      new NextRequest('http://localhost/api/certificates/cert-1'),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(401);
  });

  it('should return 403 if not a PRO', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'CLIENT', email: 'test@example.com', suspended: false },
    } as any);

    const response = await deleteCert(
      new NextRequest('http://localhost/api/certificates/cert-1'),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(403);
  });

  it('should return 404 if certificate not found', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue({ id: 'pro-1' } as any);
    vi.mocked(prisma.proCertificate.findUnique).mockResolvedValue(null);

    const response = await deleteCert(
      new NextRequest('http://localhost/api/certificates/cert-1'),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(404);
  });

  it('should return 403 if certificate belongs to another PRO', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue({ id: 'pro-1' } as any);
    vi.mocked(prisma.proCertificate.findUnique).mockResolvedValue({
      id: 'cert-1',
      proId: 'pro-2', // Different PRO
    } as any);

    const response = await deleteCert(
      new NextRequest('http://localhost/api/certificates/cert-1'),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(403);
  });

  it('should delete certificate if owned by PRO', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue({ id: 'pro-1' } as any);
    vi.mocked(prisma.proCertificate.findUnique).mockResolvedValue({
      id: 'cert-1',
      proId: 'pro-1',
    } as any);
    vi.mocked(prisma.proCertificate.delete).mockResolvedValue({} as any);

    const response = await deleteCert(
      new NextRequest('http://localhost/api/certificates/cert-1'),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(200);
    expect(prisma.proCertificate.delete).toHaveBeenCalledWith({
      where: { id: 'cert-1' },
    });
  });
});

describe('POST /api/certificates/[id]/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const response = await verifyCert(
      new NextRequest('http://localhost/api/certificates/cert-1/verify', {
        method: 'POST',
        body: JSON.stringify({ verificationEmail: 'test@example.com' }),
      }),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(401);
  });

  it('should return 400 if email is missing', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', suspended: false },
    } as any);

    const response = await verifyCert(
      new NextRequest('http://localhost/api/certificates/cert-1/verify', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
      { params: { id: 'cert-1' } }
    );

    expect(response.status).toBe(400);
  });

  it('should generate token and send verification email', async () => {
    (auth as any).mockResolvedValue({
      user: { id: 'user-1', role: 'PRO', email: 'pro@example.com', name: 'Jan Bakker', suspended: false },
    } as any);

    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue({
      id: 'pro-1',
      companyName: 'Bakker BV',
    } as any);

    const mockCert = {
      id: 'cert-1',
      proId: 'pro-1',
      certificateType: {
        name: 'VCA Veiligheid',
      },
    };
    vi.mocked(prisma.proCertificate.findUnique).mockResolvedValue(mockCert as any);
    vi.mocked(prisma.proCertificate.update).mockResolvedValue({} as any);

    const response = await verifyCert(
      new NextRequest('http://localhost/api/certificates/cert-1/verify', {
        method: 'POST',
        body: JSON.stringify({ verificationEmail: 'verify@example.com' }),
      }),
      { params: { id: 'cert-1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');
    expect(generateVerificationToken).toHaveBeenCalled();
    expect(getVerificationEmailContent).toHaveBeenCalled();
    expect(prisma.proCertificate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cert-1' },
        data: expect.objectContaining({
          verificationEmail: 'verify@example.com',
          verificationToken: 'mock-token-123',
        }),
      })
    );
  });
});

describe('GET /api/certificates/verify-token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if token is missing', async () => {
    const request = new NextRequest('http://localhost/api/certificates/verify-token');
    const response = await verifyToken(request);

    expect(response.status).toBe(400);
  });

  it('should return 404 if token is invalid', async () => {
    vi.mocked(prisma.proCertificate.findFirst).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/certificates/verify-token?token=invalid-token');
    const response = await verifyToken(request);

    expect(response.status).toBe(404);
  });

  it('should verify certificate and redirect to success page', async () => {
    const mockCert = {
      id: 'cert-1',
      proId: 'pro-1',
      status: CertificateStatus.PENDING,
      verificationToken: 'valid-token',
    };
    vi.mocked(prisma.proCertificate.findFirst).mockResolvedValue(mockCert as any);
    vi.mocked(prisma.proCertificate.update).mockResolvedValue({
      ...mockCert,
      status: CertificateStatus.VERIFIED,
      verifiedAt: new Date(),
    } as any);

    const request = new NextRequest('http://localhost/api/certificates/verify-token?token=valid-token');
    const response = await verifyToken(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('success');
    expect(prisma.proCertificate.update).toHaveBeenCalledWith({
      where: { id: 'cert-1' },
      data: {
        status: CertificateStatus.VERIFIED,
        verifiedAt: expect.any(Date),
        verificationToken: null,
      },
    });
  });
});
