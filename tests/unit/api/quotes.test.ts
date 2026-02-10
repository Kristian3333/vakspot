// tests/unit/api/quotes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/quotes/route';
import { createMockSession, createTestQuote, createTestBid, createTestProProfile } from '../../setup';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    quote: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    proProfile: {
      findUnique: vi.fn(),
    },
    bid: {
      findUnique: vi.fn(),
    },
    job: {
      update: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
    conversation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

describe('GET /api/quotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/quotes');
    const response = await GET(request as any);

    expect(response.status).toBe(401);
  });

  it('should return PRO quotes when authenticated as PRO', async () => {
    const session = createMockSession({ role: 'PRO', userId: 'user-pro' });
    const proProfile = createTestProProfile({ userId: 'user-pro' });
    const quotes = [createTestQuote()];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.quote.findMany).mockResolvedValue(quotes as any);

    const request = new Request('http://localhost:3000/api/quotes');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quotes).toBeDefined();
  });

  it('should return 404 if PRO profile not found', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/quotes');
    const response = await GET(request as any);

    expect(response.status).toBe(404);
  });

  it('should return CLIENT quotes when authenticated as CLIENT', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-client' });
    const quotes = [createTestQuote()];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.quote.findMany).mockResolvedValue(quotes as any);

    const request = new Request('http://localhost:3000/api/quotes');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quotes).toBeDefined();
  });

  it('should filter quotes by bidId when provided', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.quote.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/quotes?bidId=bid-123');
    await GET(request as any);

    expect(prisma.quote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          bidId: 'bid-123',
        }),
      })
    );
  });

  it('should return 403 for invalid role', async () => {
    const session = createMockSession({ role: 'ADMIN' });
    vi.mocked(auth).mockResolvedValue(session as any);

    const request = new Request('http://localhost:3000/api/quotes');
    const response = await GET(request as any);

    expect(response.status).toBe(403);
  });
});

describe('POST /api/quotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated or not PRO', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });

  it('should successfully create quote when valid', async () => {
    const session = createMockSession({ role: 'PRO', userId: 'user-pro' });
    const proProfile = createTestProProfile({ userId: 'user-pro' });
    const bid = createTestBid({ proId: proProfile.id });
    const quote = createTestQuote();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue({
      ...bid,
      job: { id: 'job-123', status: 'IN_CONVERSATION', title: 'Job' },
    } as any);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.quote.create).mockResolvedValue(quote as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({} as any);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({ id: 'conv-123' } as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);
    vi.mocked(prisma.conversation.update).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 20000,
        amountType: 'ESTIMATE',
        description: 'Quote description here',
        validDays: 14,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.quote).toBeDefined();
    expect(prisma.quote.create).toHaveBeenCalled();
  });

  it('should return 404 if PRO profile not found', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 10000,
        description: 'Description',
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(404);
  });

  it('should return 404 if bid not found or not owned by PRO', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile({ id: 'pro-123' });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 10000,
        description: 'Description',
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(404);
  });

  it('should return 400 if job is not in valid state for quotes', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const bid = createTestBid({ proId: proProfile.id });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue({
      ...bid,
      job: { id: 'job-123', status: 'COMPLETED_BY_CONSUMER', title: 'Job' },
    } as any);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 10000,
        description: 'Description',
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });

  it('should return 400 if pending quote already exists', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const bid = createTestBid({ proId: proProfile.id });
    const existingQuote = createTestQuote({ status: 'PENDING' });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue({
      ...bid,
      job: { id: 'job-123', status: 'IN_CONVERSATION', title: 'Job' },
    } as any);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(existingQuote as any);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 10000,
        description: 'Description',
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('openstaande offerte');
  });

  it('should auto-transition job to QUOTE_RECEIVED', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const bid = createTestBid({ proId: proProfile.id });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue({
      ...bid,
      job: { id: 'job-123', status: 'IN_CONVERSATION', title: 'Job' },
    } as any);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.quote.create).mockResolvedValue(createTestQuote() as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({} as any);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 10000,
        description: 'Description with minimum length',
      }),
    });

    await POST(request as any);

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job-123' },
      data: expect.objectContaining({
        status: 'QUOTE_RECEIVED',
      }),
    });
    expect(prisma.statusHistory.create).toHaveBeenCalled();
  });

  it('should create message in conversation about quote', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const bid = createTestBid({ proId: proProfile.id });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue({
      ...bid,
      job: { id: 'job-123', status: 'IN_CONVERSATION', title: 'Job' },
    } as any);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.quote.create).mockResolvedValue(createTestQuote() as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({} as any);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({ id: 'conv-123' } as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);
    vi.mocked(prisma.conversation.update).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 25000,
        amountType: 'FIXED',
        description: 'Detailed quote description',
        validDays: 14,
      }),
    });

    await POST(request as any);

    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conversationId: 'conv-123',
          senderId: 'user-123',
          content: expect.stringContaining('€250.00'),
        }),
      })
    );
    expect(prisma.conversation.update).toHaveBeenCalled();
  });

  it('should set validUntil date based on validDays parameter', async () => {
    const session = createMockSession({ role: 'PRO' });
    const proProfile = createTestProProfile();
    const bid = createTestBid({ proId: proProfile.id });

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.bid.findUnique).mockResolvedValue({
      ...bid,
      job: { id: 'job-123', status: 'IN_CONVERSATION', title: 'Job' },
    } as any);
    vi.mocked(prisma.quote.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.quote.create).mockResolvedValue(createTestQuote() as any);
    vi.mocked(prisma.job.update).mockResolvedValue({} as any);
    vi.mocked(prisma.statusHistory.create).mockResolvedValue({} as any);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        bidId: 'bid-123',
        amount: 10000,
        description: 'Description here',
        validDays: 30,
      }),
    });

    await POST(request as any);

    expect(prisma.quote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          validUntil: expect.any(Date),
        }),
      })
    );
  });
});
