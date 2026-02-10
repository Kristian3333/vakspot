// tests/unit/api/jobs.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/jobs/route';
import { createMockSession, createTestJob, createTestClientProfile } from '../../setup';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    job: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    clientProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/validations', () => ({
  createJobSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock('@/lib/geo/dutch-postcodes', () => ({
  geocodePostcode: vi.fn(() => ({ lat: 52.3676, lng: 4.9041 })),
}));

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createJobSchema } from '@/lib/validations';

describe('GET /api/jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return client jobs when authenticated as CLIENT', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-123' });
    const clientProfile = createTestClientProfile({ userId: 'user-123' });
    const jobs = [createTestJob()];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(prisma.job.findMany).mockResolvedValue(jobs as any);
    vi.mocked(prisma.job.count).mockResolvedValue(1);

    const request = new Request('http://localhost:3000/api/jobs');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.jobs).toBeDefined();
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(prisma.clientProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    });
  });

  it('should return empty array if client profile not found', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/jobs');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.jobs).toEqual([]);
    expect(data.total).toBe(0);
  });

  it('should filter jobs by status when provided', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const clientProfile = createTestClientProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(prisma.job.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job.count).mockResolvedValue(0);

    const request = new Request('http://localhost:3000/api/jobs?status=COMPLETED_BY_CONSUMER');
    await GET(request as any);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'COMPLETED_BY_CONSUMER',
        }),
      })
    );
  });

  it('should support pagination parameters', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const clientProfile = createTestClientProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(prisma.job.findMany).mockResolvedValue([]);
    vi.mocked(prisma.job.count).mockResolvedValue(0);

    const request = new Request('http://localhost:3000/api/jobs?page=2&limit=10');
    const response = await GET(request as any);
    const data = await response.json();

    expect(data.page).toBe(2);
    expect(data.pageSize).toBe(10);
    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('should return only CREATED jobs for unauthenticated users', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    vi.mocked(prisma.job.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/jobs');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'CREATED',
        }),
      })
    );
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(auth).mockRejectedValue(new Error('Auth failed'));

    const request = new Request('http://localhost:3000/api/jobs');
    const response = await GET(request as any);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch jobs');
  });
});

describe('POST /api/jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create job when authenticated as CLIENT', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-123' });
    const clientProfile = createTestClientProfile({ userId: 'user-123' });
    const newJob = createTestJob({ title: 'New Job' });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(createJobSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        title: 'New Job',
        description: 'Job description',
        categoryId: 'cat-1',
        locationCity: 'Amsterdam',
        locationPostcode: '1012AB',
        budgetType: 'ESTIMATE',
        timeline: 'FLEXIBLE',
      },
    } as any);
    vi.mocked(prisma.job.create).mockResolvedValue(newJob as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Job',
        description: 'Job description',
        categoryId: 'cat-1',
        locationCity: 'Amsterdam',
        locationPostcode: '1012AB',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(prisma.job.create).toHaveBeenCalled();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should return 403 if user is not CLIENT or ADMIN', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(403);
  });

  it('should return 400 for validation errors', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createJobSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: { title: ['Title is required'] },
        }),
      },
    } as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it('should create client profile if not exists', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-123' });
    const newClientProfile = createTestClientProfile({ userId: 'user-123' });
    const newJob = createTestJob();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.clientProfile.create).mockResolvedValue(newClientProfile as any);
    vi.mocked(createJobSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        title: 'Job',
        description: 'Description',
        categoryId: 'cat-1',
        locationCity: 'Amsterdam',
        locationPostcode: '1012AB',
      },
    } as any);
    vi.mocked(prisma.job.create).mockResolvedValue(newJob as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.clientProfile.create).toHaveBeenCalledWith({
      data: { userId: 'user-123' },
    });
  });

  it('should auto-publish job with CREATED status', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const clientProfile = createTestClientProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(createJobSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        title: 'Job',
        description: 'Description',
        categoryId: 'cat-1',
        locationCity: 'Amsterdam',
        locationPostcode: '1012AB',
      },
    } as any);
    vi.mocked(prisma.job.create).mockResolvedValue(createTestJob() as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.job.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CREATED',
          publishedAt: expect.any(Date),
        }),
      })
    );
  });

  it('should geocode postal code and set coordinates', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const clientProfile = createTestClientProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(createJobSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        title: 'Job',
        description: 'Description',
        categoryId: 'cat-1',
        locationCity: 'Amsterdam',
        locationPostcode: '1012AB',
      },
    } as any);
    vi.mocked(prisma.job.create).mockResolvedValue(createTestJob() as any);

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.job.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          locationLat: 52.3676,
          locationLng: 4.9041,
        }),
      })
    );
  });

  it('should handle errors gracefully', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(500);
  });
});
