// tests/unit/api/bids.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/bids/route';
import { createMockSession, createTestBid, createTestJob, createTestProProfile } from '../../setup';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    bid: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    proProfile: {
      findUnique: vi.fn(),
    },
    job: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/validations', () => ({
  createBidSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock('@/lib/email', () => ({
  sendNewInterestEmail: vi.fn().mockResolvedValue(true),
}));

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createBidSchema } from '@/lib/validations';

describe('GET /api/bids', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/bids');
    const response = await GET(request as any);

    expect(response.status).toBe(401);
  });

  it('should return PRO bids when authenticated as PRO', async () => {
    const session = createMockSession({ role: 'PRO', userId: 'user-pro' });
    const proProfile = createTestProProfile({ userId: 'user-pro' });
    const bids = [{
      ...createTestBid(),
      job: {
        id: 'job-123',
        category: { id: 'cat-1', name: 'Plumbing', icon: 'wrench' },
        client: {
          city: 'Amsterdam',
          user: { name: 'Client' },
        },
        images: [],
      },
      conversation: { id: 'conv-123' },
    }];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findMany).mockResolvedValue(bids as any);

    const request = new Request('http://localhost:3000/api/bids');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.bids).toBeDefined();
    expect(prisma.proProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-pro' },
    });
  });

  it('should return 404 if PRO profile not found', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/bids');
    const response = await GET(request as any);

    expect(response.status).toBe(404);
  });

  it('should return bids for specific job when CLIENT requests with jobId', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-client' });
    const job = createTestJob({ clientId: 'client-123' });
    const bids = [createTestBid()];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.job.findFirst).mockResolvedValue(job as any);
    vi.mocked(prisma.bid.findMany).mockResolvedValue(bids as any);

    const request = new Request('http://localhost:3000/api/bids?jobId=job-123');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.bids).toBeDefined();
    expect(prisma.job.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'job-123',
        client: { userId: 'user-client' },
      },
    });
  });

  it('should return 400 if CLIENT does not provide jobId', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);

    const request = new Request('http://localhost:3000/api/bids');
    const response = await GET(request as any);

    expect(response.status).toBe(400);
  });

  it('should filter bids by status when provided', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/bids?status=ACCEPTED');
    await GET(request as any);

    expect(prisma.bid.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACCEPTED',
        }),
      })
    );
  });
});

describe('POST /api/bids', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated or not PRO', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should return 401 if user is not PRO', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should successfully create bid when valid', async () => {
    const session = createMockSession({ role: 'PRO', userId: 'user-pro' });
    const proProfile = createTestProProfile({ userId: 'user-pro' });
    const job = createTestJob({ status: 'CREATED' });
    const newBid = { ...createTestBid(), conversation: { id: 'conv-123' }, job: { title: 'Job Title' } };

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        jobId: 'job-123',
        message: 'I am interested',
      },
    } as any);
    vi.mocked(prisma.job.findUnique).mockResolvedValue({
      ...job,
      client: {
        userId: 'client-user',
        user: { email: 'client@example.com', name: 'Client', emailNewInterest: true },
      },
    } as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.bid.create).mockResolvedValue(newBid as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({} as any);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({
        jobId: 'job-123',
        message: 'I am interested',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.bid).toBeDefined();
    expect(prisma.bid.create).toHaveBeenCalled();
    expect(prisma.message.create).toHaveBeenCalled();
  });

  it('should return 400 for validation errors', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: { message: ['Message is required'] },
        }),
      },
    } as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it('should return 404 if PRO profile not found', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', message: 'Message' },
    } as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(404);
  });

  it('should return 400 if job is not available', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const job = createTestJob({ status: 'COMPLETED_BY_CONSUMER' });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', message: 'Message' },
    } as any);
    vi.mocked(prisma.job.findUnique).mockResolvedValue(job as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it('should enforce one-bid-per-PRO-per-job constraint', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const job = createTestJob({ status: 'CREATED' });
    const existingBid = createTestBid();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', message: 'Message' },
    } as any);
    vi.mocked(prisma.job.findUnique).mockResolvedValue(job as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue(existingBid as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('al interesse getoond');
  });

  it('should auto-transition job to RESPONSES_RECEIVED on first bid', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const job = createTestJob({ status: 'CREATED' });
    const newBid = { ...createTestBid(), conversation: { id: 'conv-123' }, job: { title: 'Job' } };

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', message: 'Message' },
    } as any);
    vi.mocked(prisma.job.findUnique).mockResolvedValue({
      ...job,
      client: { userId: 'client', user: { email: 'c@example.com', name: 'C', emailNewInterest: false } },
    } as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.bid.create).mockResolvedValue(newBid as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({} as any);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job-123' },
      data: expect.objectContaining({
        status: 'RESPONSES_RECEIVED',
      }),
    });
    expect(prisma.statusHistory.create).toHaveBeenCalled();
  });

  it('should not update job status if already past CREATED', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const job = createTestJob({ status: 'RESPONSES_RECEIVED' });
    const newBid = { ...createTestBid(), conversation: { id: 'conv-123' }, job: { title: 'Job' } };

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', message: 'Message' },
    } as any);
    vi.mocked(prisma.job.findUnique).mockResolvedValue({
      ...job,
      client: { userId: 'client', user: { email: 'c@example.com', name: 'C', emailNewInterest: false } },
    } as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.bid.create).mockResolvedValue(newBid as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.job.update).not.toHaveBeenCalled();
  });

  it('should create conversation with bid', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const job = createTestJob({ status: 'CREATED' });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(createBidSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', message: 'Message' },
    } as any);
    vi.mocked(prisma.job.findUnique).mockResolvedValue({
      ...job,
      client: { userId: 'client', user: { email: 'c@example.com', name: 'C', emailNewInterest: false } },
    } as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.bid.create).mockResolvedValue({
      ...createTestBid(),
      conversation: { id: 'conv-123' },
      job: { title: 'Job' },
    } as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/bids', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.bid.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conversation: { create: {} },
        }),
      })
    );
  });
});
