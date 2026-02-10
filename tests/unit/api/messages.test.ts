// tests/unit/api/messages.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/messages/route';
import { createMockSession, createTestProProfile, createTestClientProfile } from '../../setup';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    proProfile: {
      findUnique: vi.fn(),
    },
    clientProfile: {
      findUnique: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

describe('GET /api/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);

    expect(response.status).toBe(401);
  });

  it('should return conversations for PRO', async () => {
    const session = createMockSession({ role: 'PRO', userId: 'user-pro' });
    const proProfile = createTestProProfile({ userId: 'user-pro' });
    const conversations = [
      {
        id: 'conv-1',
        updatedAt: new Date(),
        bid: {
          job: {
            id: 'job-1',
            title: 'Test Job',
            status: 'IN_CONVERSATION',
            images: [],
            client: {
              user: { id: 'client-1', name: 'Client', image: null },
            },
          },
        },
        messages: [
          {
            createdAt: new Date(),
            sender: { id: 'client-1', name: 'Client' },
          },
        ],
        _count: { messages: 2 },
      },
    ];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(proProfile as any);
    vi.mocked(prisma.conversation.findMany).mockResolvedValue(conversations as any);

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations).toBeDefined();
    expect(data.conversations).toHaveLength(1);
  });

  it('should return empty array if PRO profile not found', async () => {
    const session = createMockSession({ role: 'PRO' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.proProfile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations).toEqual([]);
  });

  it('should return conversations for CLIENT', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-client' });
    const clientProfile = createTestClientProfile({ userId: 'user-client' });
    const conversations = [
      {
        id: 'conv-1',
        updatedAt: new Date(),
        bid: {
          job: {
            id: 'job-1',
            title: 'Test Job',
            status: 'IN_CONVERSATION',
            images: [],
          },
          pro: {
            companyName: 'Pro BV',
            user: { id: 'pro-1', name: 'Pro', image: null },
          },
        },
        messages: [
          {
            createdAt: new Date(),
            sender: { id: 'pro-1', name: 'Pro' },
          },
        ],
        _count: { messages: 1 },
      },
    ];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(prisma.conversation.findMany).mockResolvedValue(conversations as any);

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations).toBeDefined();
  });

  it('should return empty array if CLIENT profile not found', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations).toEqual([]);
  });

  it('should return unread message count', async () => {
    const session = createMockSession({ role: 'CLIENT', userId: 'user-client' });
    const clientProfile = createTestClientProfile({ userId: 'user-client' });
    const conversations = [
      {
        id: 'conv-1',
        updatedAt: new Date(),
        bid: {
          job: { id: 'job-1', title: 'Job', status: 'IN_CONVERSATION', images: [] },
          pro: {
            companyName: 'Pro',
            user: { id: 'pro-1', name: 'Pro', image: null },
          },
        },
        messages: [],
        _count: { messages: 3 },
      },
    ];

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(prisma.conversation.findMany).mockResolvedValue(conversations as any);

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations[0]._count.messages).toBe(3);
  });

  it('should sort conversations by updatedAt desc', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    const clientProfile = createTestClientProfile();

    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(clientProfile as any);
    vi.mocked(prisma.conversation.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/messages');
    await GET(request as any);

    expect(prisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { updatedAt: 'desc' },
      })
    );
  });

  it('should handle errors gracefully', async () => {
    const session = createMockSession({ role: 'CLIENT' });
    vi.mocked(auth).mockResolvedValue(session as any);
    vi.mocked(prisma.clientProfile.findUnique).mockRejectedValue(new Error('DB error'));

    const request = new Request('http://localhost:3000/api/messages');
    const response = await GET(request as any);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch conversations');
  });
});
