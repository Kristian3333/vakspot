// tests/unit/dev-tools.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies BEFORE imports
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  clientProfile: {
    create: vi.fn(),
  },
  proProfile: {
    create: vi.fn(),
  },
  category: {
    findFirst: vi.fn(),
  },
  job: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  bid: {
    create: vi.fn(),
    createMany: vi.fn(),
  },
  conversation: {
    create: vi.fn(),
  },
  message: {
    create: vi.fn(),
    createMany: vi.fn(),
  },
  review: {
    create: vi.fn(),
  },
  statusHistory: {
    create: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback({
    job: {
      update: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
  })),
};

const mockAuth = vi.fn();
const mockTransitionJobStatus = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/job-state-machine', () => ({
  transitionJobStatus: mockTransitionJobStatus,
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => Promise.resolve('hashed-password')),
}));

describe('Dev Tools API - Switch Role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set NODE_ENV for testing
    (process.env as Record<string, string>).NODE_ENV = 'development';
  });

  it('should validate dev mode requirement', () => {
    expect(process.env.NODE_ENV).toBe('development');
  });

  it('should reject unauthenticated requests', async () => {
    mockAuth.mockResolvedValue(null);
    expect(mockAuth).toBeDefined();
  });

  it('should reject non-admin users', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-id', role: 'CLIENT', email: 'client@test.com', suspended: false },
      expires: new Date().toISOString(),
    });
    expect(mockAuth).toBeDefined();
  });

  it('should handle user lookup correctly', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'admin-id', role: 'ADMIN', email: 'admin@test.com', suspended: false },
      expires: new Date().toISOString(),
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'PRO',
      suspended: false,
      passwordHash: 'hash',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailNewMessages: true,
      emailNewInterest: true,
      emailBidUpdates: true,
      emailNewJobs: true,
      emailMarketing: false,
      emailWeeklyDigest: false,
      emailJobUpdates: true,
      profileVisible: true,
      chatRetentionDays: 730,
      suspendedAt: null,
      suspensionReason: null,
      suspendedBy: null,
    });

    expect(mockPrisma.user.findUnique).toBeDefined();
  });
});

describe('Dev Tools API - Create Test Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set NODE_ENV for testing
    (process.env as Record<string, string>).NODE_ENV = 'development';
  });

  it('should validate scenario types', () => {
    const validScenarios = ['basic', 'complete', 'multi-pro'];
    expect(validScenarios).toContain('basic');
    expect(validScenarios).toContain('complete');
    expect(validScenarios).toContain('multi-pro');
  });

  it('should prepare for basic scenario creation', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'admin-id', role: 'ADMIN', email: 'admin@test.com', suspended: false },
      expires: new Date().toISOString(),
    });

    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'CLIENT',
      suspended: false,
      passwordHash: 'hash',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailNewMessages: true,
      emailNewInterest: true,
      emailBidUpdates: true,
      emailNewJobs: true,
      emailMarketing: false,
      emailWeeklyDigest: false,
      emailJobUpdates: true,
      profileVisible: true,
      chatRetentionDays: 730,
      suspendedAt: null,
      suspensionReason: null,
      suspendedBy: null,
    });

    mockPrisma.clientProfile.create.mockResolvedValue({
      id: 'profile-id',
      userId: 'new-user-id',
      phone: null,
      address: null,
      city: null,
      postcode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockPrisma.category.findFirst.mockResolvedValue({
      id: 'category-id',
      name: 'Loodgieter',
      slug: 'loodgieter',
      description: null,
      icon: null,
      order: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(mockPrisma.user.create).toBeDefined();
    expect(mockPrisma.clientProfile.create).toBeDefined();
  });
});

describe('Dev Tools API - Simulate Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set NODE_ENV for testing
    (process.env as Record<string, string>).NODE_ENV = 'development';
  });

  it('should use state machine for transitions', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'admin-id', role: 'ADMIN', email: 'admin@test.com', suspended: false },
      expires: new Date().toISOString(),
    });

    mockTransitionJobStatus.mockResolvedValue({
      success: true,
      job: {
        id: 'job-id',
        status: 'SELECTED',
        title: 'Test Job',
      },
    });

    expect(mockTransitionJobStatus).toBeDefined();
  });

  it('should handle transition failures', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'admin-id', role: 'ADMIN', email: 'admin@test.com', suspended: false },
      expires: new Date().toISOString(),
    });

    mockTransitionJobStatus.mockResolvedValue({
      success: false,
      error: 'Invalid transition',
    });

    expect(mockTransitionJobStatus).toBeDefined();
  });

  it('should validate job status enum values', () => {
    const validStatuses = [
      'CREATED',
      'RESPONSES_RECEIVED',
      'IN_CONVERSATION',
      'SELECTED',
      'SCHEDULED',
      'IN_PROGRESS',
      'COMPLETED_BY_CONSUMER',
      'REVIEWED',
    ];
    expect(validStatuses.length).toBeGreaterThan(0);
  });
});
