// tests/unit/api/reviews.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/reviews/route';
import { createMockSession, createTestJob, createTestReview } from '../../setup';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    review: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    job: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    proProfile: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/validations', () => ({
  createReviewSchema: {
    safeParse: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validations';

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return reviews for a PRO', async () => {
    const reviews = [createTestReview()];
    vi.mocked(prisma.review.findMany).mockResolvedValue(reviews as any);

    const request = new Request('http://localhost:3000/api/reviews?proId=pro-123');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews).toBeDefined();
    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { proId: 'pro-123' },
      })
    );
  });

  it('should return 400 if proId not provided', async () => {
    const request = new Request('http://localhost:3000/api/reviews');
    const response = await GET(request as any);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Pro ID required');
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(prisma.review.findMany).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost:3000/api/reviews?proId=pro-123');
    const response = await GET(request as any);

    expect(response.status).toBe(500);
  });
});

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated or not CLIENT', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should return 401 if user is not CLIENT', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should successfully create review for completed job', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-client' });
    const job = createTestJob({ status: 'COMPLETED_BY_CONSUMER' });
    const review = createTestReview();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        jobId: 'job-123',
        rating: 5,
        title: 'Great work',
        content: 'Very satisfied',
      },
    } as any);
    vi.mocked(prisma.job.findFirst).mockResolvedValue({
      ...job,
      acceptedBid: { proId: 'pro-123' },
    } as any);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.review.create).mockResolvedValue(review as any);
    vi.mocked(prisma.review.findMany).mockResolvedValue([review] as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.proProfile.update).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.review).toBeDefined();
    expect(prisma.review.create).toHaveBeenCalled();
  });

  it('should return 400 for validation errors', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: { rating: ['Rating is required'] },
        }),
      },
    } as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it('should only allow reviews for completed jobs', async () => {
    const session = createMockSession({ role: 'CLIENT' });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', rating: 5, title: 'Title', content: 'Content' },
    } as any);
    // Return null initially to simulate job not found in first query (completed jobs)
    vi.mocked(prisma.job.findFirst).mockResolvedValueOnce(null);
    // Then return the pending job in the second query
    vi.mocked(prisma.job.findFirst).mockResolvedValueOnce({
      ...createTestJob({ status: 'IN_PROGRESS' }),
      status: 'IN_PROGRESS',
    } as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('voltooid');
  });

  it('should enforce one review per job', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const job = createTestJob({ status: 'COMPLETED_BY_CONSUMER' });
    const existingReview = createTestReview();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', rating: 5, title: 'Title', content: 'Content' },
    } as any);
    vi.mocked(prisma.job.findFirst).mockResolvedValue({
      ...job,
      acceptedBid: { proId: 'pro-123' },
    } as any);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(existingReview as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('already exists');
  });

  it('should update job status to REVIEWED', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const job = createTestJob({ status: 'COMPLETED_BY_CONSUMER' });
    const review = createTestReview();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', rating: 5, title: 'Title', content: 'Content' },
    } as any);
    vi.mocked(prisma.job.findFirst).mockResolvedValue({
      ...job,
      acceptedBid: { proId: 'pro-123' },
    } as any);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.review.create).mockResolvedValue(review as any);
    vi.mocked(prisma.review.findMany).mockResolvedValue([review] as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.proProfile.update).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job-123' },
      data: { status: 'REVIEWED' },
    });
  });

  it('should update PRO average rating', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const job = createTestJob({ status: 'COMPLETED_BY_CONSUMER' });
    const review1 = createTestReview({ rating: 5 });
    const review2 = createTestReview({ rating: 4 });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: { jobId: 'job-123', rating: 5, title: 'Title', content: 'Content' },
    } as any);
    vi.mocked(prisma.job.findFirst).mockResolvedValue({
      ...job,
      acceptedBid: { proId: 'pro-123' },
    } as any);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.review.create).mockResolvedValue(review1 as any);
    vi.mocked(prisma.review.findMany).mockResolvedValue([review1, review2] as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.proProfile.update).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request as any);

    expect(prisma.proProfile.update).toHaveBeenCalledWith({
      where: { id: 'pro-123' },
      data: {
        avgRating: 4.5,
        totalReviews: 2,
      },
    });
  });

  it('should validate rating is between 1-5', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(createReviewSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        flatten: () => ({
          fieldErrors: { rating: ['Rating must be between 1 and 5'] },
        }),
      },
    } as any);

    const request = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: 6 }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });
});
