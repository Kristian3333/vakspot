// tests/unit/api/profiles.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { CertificateStatus } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    proProfile: {
      findUnique: vi.fn(),
    },
    clientProfile: {
      findUnique: vi.fn(),
    },
    job: {
      count: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';

// Import route handler (will be created)
import { GET as getProfile } from '@/app/api/profiles/[id]/route';

describe('GET /api/profiles/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 404 if user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );

    expect(response.status).toBe(404);
  });

  it('should return 404 if profile is not visible', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'PRO',
      profileVisible: false,
      createdAt: new Date(),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );

    expect(response.status).toBe(404);
  });

  it('should return client profile with minimal info', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'client@example.com',
      name: 'John Doe',
      role: 'CLIENT',
      profileVisible: true,
      createdAt: new Date('2024-01-01'),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({
      id: 'client-1',
      userId: 'user-1',
    } as any);
    vi.mocked(prisma.job.count).mockResolvedValue(5);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('profile');
    expect(data.profile.role).toBe('CLIENT');
    expect(data.profile.name).toBe('John Doe');
    expect(data.profile.jobCount).toBe(5);
    expect(data.profile).not.toHaveProperty('email');
    expect(data.profile).not.toHaveProperty('phone');
  });

  it('should return PRO profile with full details', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'pro@example.com',
      name: 'Jan Bakker',
      role: 'PRO',
      profileVisible: true,
      createdAt: new Date('2024-01-01'),
    };

    const mockProProfile = {
      id: 'pro-1',
      userId: 'user-1',
      companyName: 'Bakker BV',
      description: 'Professional builder',
      verified: true,
      avgRating: 4.5,
      totalReviews: 10,
      locationCity: 'Amsterdam',
      categories: [
        {
          category: {
            id: 'cat-1',
            name: 'Bouw',
            slug: 'bouw',
          },
          yearsExp: 5,
        },
      ],
      certificates: [
        {
          id: 'cert-1',
          status: CertificateStatus.VERIFIED,
          verifiedAt: new Date(),
          certificateType: {
            id: 'type-1',
            code: 'VCA',
            name: 'VCA Veiligheid',
            clientLabel: 'VCA-gecertificeerd',
          },
        },
      ],
      reviews: [
        {
          id: 'review-1',
          rating: 5,
          title: 'Great work',
          content: 'Very professional',
          createdAt: new Date(),
          response: null,
          respondedAt: null,
        },
      ],
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(mockProProfile as any);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('profile');
    expect(data.profile.role).toBe('PRO');
    expect(data.profile.companyName).toBe('Bakker BV');
    expect(data.profile.verified).toBe(true);
    expect(data.profile.avgRating).toBe(4.5);
    expect(data.profile.categories).toHaveLength(1);
    expect(data.profile.certificates).toHaveLength(1);
    expect(data.profile.reviews).toHaveLength(1);
    expect(data.profile).not.toHaveProperty('email');
  });

  it('should only return verified certificates for PRO', async () => {
    const mockUser = {
      id: 'user-1',
      role: 'PRO',
      profileVisible: true,
      createdAt: new Date(),
    };

    const mockProProfile = {
      id: 'pro-1',
      userId: 'user-1',
      companyName: 'Test BV',
      certificates: [
        {
          id: 'cert-1',
          status: CertificateStatus.VERIFIED,
          certificateType: { name: 'VCA' },
        },
        {
          id: 'cert-2',
          status: CertificateStatus.PENDING,
          certificateType: { name: 'BHV' },
        },
      ],
      categories: [],
      reviews: [],
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(mockProProfile as any);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );

    expect(response.status).toBe(200);

    // Verify that findUnique was called with status filter
    expect(prisma.proProfile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        include: expect.objectContaining({
          certificates: expect.objectContaining({
            where: { status: CertificateStatus.VERIFIED },
          }),
        }),
      })
    );
  });

  it('should handle PRO without proProfile gracefully', async () => {
    const mockUser = {
      id: 'user-1',
      role: 'PRO',
      profileVisible: true,
      createdAt: new Date(),
      name: 'Test User',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );

    expect(response.status).toBe(404);
  });

  it('should include member since date for all users', async () => {
    const createdDate = new Date('2024-01-15');
    const mockUser = {
      id: 'user-1',
      role: 'CLIENT',
      profileVisible: true,
      createdAt: createdDate,
      name: 'Test User',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({
      id: 'client-1',
      userId: 'user-1',
    } as any);
    vi.mocked(prisma.job.count).mockResolvedValue(0);

    const response = await getProfile(
      new NextRequest('http://localhost/api/profiles/user-1'),
      { params: { id: 'user-1' } }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile.memberSince).toBeDefined();
  });
});
