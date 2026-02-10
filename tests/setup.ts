// tests/setup.ts
/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// ============================================
// TEST HELPERS & MOCKS
// ============================================

/**
 * Create mock Prisma client for API tests
 */
export function createMockPrisma() {
  return {
    job: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    bid: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    quote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
    clientProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    proProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      // For simple cases, execute callback with the mock prisma
      const txClient = createMockPrisma();
      return Promise.resolve(callback(txClient));
    }),
  };
}

/**
 * Create mock NextAuth session
 */
export function createMockSession(overrides?: {
  userId?: string;
  email?: string;
  name?: string;
  role?: 'CLIENT' | 'PRO' | 'ADMIN';
  image?: string;
}) {
  return {
    user: {
      id: overrides?.userId || 'user-123',
      email: overrides?.email || 'test@example.com',
      name: overrides?.name || 'Test User',
      role: overrides?.role || 'CLIENT',
      image: overrides?.image || null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Create mock NextRequest for API route testing
 */
export function createMockRequest(options?: {
  method?: string;
  url?: string;
  body?: any;
  searchParams?: Record<string, string>;
}) {
  const url = options?.url || 'http://localhost:3000/api/test';
  const urlObj = new URL(url);

  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
  }

  return {
    method: options?.method || 'GET',
    url: urlObj.toString(),
    json: async () => options?.body || {},
    headers: new Headers(),
  } as any;
}

// ============================================
// TEST DATA FACTORIES
// ============================================

/**
 * Create test user data
 */
export function createTestUser(overrides?: {
  id?: string;
  email?: string;
  name?: string;
  role?: 'CLIENT' | 'PRO' | 'ADMIN';
  emailVerified?: Date | null;
}) {
  return {
    id: overrides?.id || 'user-123',
    email: overrides?.email || 'test@example.com',
    passwordHash: 'hashed-password',
    name: overrides?.name || 'Test User',
    role: overrides?.role || 'CLIENT',
    emailVerified: overrides?.emailVerified !== undefined ? overrides.emailVerified : new Date(),
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
    suspended: false,
    suspendedAt: null,
    suspensionReason: null,
    suspendedBy: null,
  };
}

/**
 * Create test client profile data
 */
export function createTestClientProfile(overrides?: {
  id?: string;
  userId?: string;
  phone?: string;
  city?: string;
  postcode?: string;
}) {
  return {
    id: overrides?.id || 'client-123',
    userId: overrides?.userId || 'user-123',
    phone: overrides?.phone || null,
    address: null,
    city: overrides?.city || null,
    postcode: overrides?.postcode || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create test pro profile data
 */
export function createTestProProfile(overrides?: {
  id?: string;
  userId?: string;
  companyName?: string;
  phone?: string;
  kvkNumber?: string;
}) {
  return {
    id: overrides?.id || 'pro-123',
    userId: overrides?.userId || 'user-456',
    companyName: overrides?.companyName || 'Test BV',
    kvkNumber: overrides?.kvkNumber || '12345678',
    entityType: 'BUSINESS' as const,
    description: 'Test company description',
    phone: overrides?.phone || '0612345678',
    website: null,
    serviceRadius: 25,
    locationLat: null,
    locationLng: null,
    locationCity: null,
    locationPostcode: null,
    verified: false,
    active: true,
    avgRating: 0,
    totalReviews: 0,
    totalJobs: 0,
    responseRate: 100,
    responseTime: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create test job data
 */
export function createTestJob(overrides?: {
  id?: string;
  clientId?: string;
  categoryId?: string;
  title?: string;
  status?: any;
  budgetMin?: number;
  budgetMax?: number;
}) {
  return {
    id: overrides?.id || 'job-123',
    clientId: overrides?.clientId || 'client-123',
    categoryId: overrides?.categoryId || 'cat-1',
    title: overrides?.title || 'Test Job',
    description: 'This is a test job description',
    status: overrides?.status || 'CREATED',
    budgetMin: overrides?.budgetMin || 10000,
    budgetMax: overrides?.budgetMax || 20000,
    budgetType: 'ESTIMATE' as const,
    locationCity: 'Amsterdam',
    locationPostcode: '1012AB',
    locationAddress: null,
    locationLat: 52.3676,
    locationLng: 4.9041,
    timeline: 'FLEXIBLE' as const,
    startDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    completedAt: null,
    completedAtByPro: null,
    completedAtByCons: null,
    startedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    statusChangedAt: new Date(),
    statusChangedBy: 'CONSUMER' as const,
    acceptedBidId: null,
  };
}

/**
 * Create test bid data
 */
export function createTestBid(overrides?: {
  id?: string;
  jobId?: string;
  proId?: string;
  status?: string;
  amount?: number;
  message?: string;
}) {
  return {
    id: overrides?.id || 'bid-123',
    jobId: overrides?.jobId || 'job-123',
    proId: overrides?.proId || 'pro-123',
    amount: overrides?.amount || 15000,
    amountType: 'ESTIMATE' as const,
    message: overrides?.message || 'I am interested in this job',
    status: overrides?.status || 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create test message data
 */
export function createTestMessage(overrides?: {
  id?: string;
  conversationId?: string;
  senderId?: string;
  content?: string;
  read?: boolean;
}) {
  return {
    id: overrides?.id || 'msg-123',
    conversationId: overrides?.conversationId || 'conv-123',
    senderId: overrides?.senderId || 'user-123',
    content: overrides?.content || 'Test message',
    read: overrides?.read !== undefined ? overrides.read : false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create test conversation data
 */
export function createTestConversation(overrides?: {
  id?: string;
  bidId?: string;
}) {
  return {
    id: overrides?.id || 'conv-123',
    bidId: overrides?.bidId || 'bid-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create test review data
 */
export function createTestReview(overrides?: {
  id?: string;
  jobId?: string;
  proId?: string;
  rating?: number;
  title?: string;
  content?: string;
}) {
  return {
    id: overrides?.id || 'review-123',
    jobId: overrides?.jobId || 'job-123',
    proId: overrides?.proId || 'pro-123',
    rating: overrides?.rating || 5,
    title: overrides?.title || 'Great work!',
    content: overrides?.content || 'Very satisfied with the service.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create test quote data
 */
export function createTestQuote(overrides?: {
  id?: string;
  bidId?: string;
  amount?: number;
  description?: string;
  status?: string;
}) {
  return {
    id: overrides?.id || 'quote-123',
    bidId: overrides?.bidId || 'bid-123',
    amount: overrides?.amount || 20000,
    amountType: 'ESTIMATE' as const,
    description: overrides?.description || 'Quote description',
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: overrides?.status || 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// RESPONSE ASSERTION HELPERS
// ============================================

/**
 * Assert JSON response structure
 */
export function assertJsonResponse(response: any, expectedStatus: number = 200) {
  expect(response.status).toBe(expectedStatus);
  expect(response.headers.get('content-type')).toContain('application/json');
}

/**
 * Assert error response structure
 */
export function assertErrorResponse(response: any, expectedStatus: number, errorMessage?: string) {
  assertJsonResponse(response, expectedStatus);
  if (errorMessage) {
    expect(response.body.error).toContain(errorMessage);
  }
}

/**
 * Assert successful creation response
 */
export function assertCreatedResponse(response: any, idField: string = 'id') {
  assertJsonResponse(response, 201);
  expect(response.body).toHaveProperty(idField);
}

/**
 * Assert pagination response structure
 */
export function assertPaginationResponse(response: any) {
  assertJsonResponse(response, 200);
  expect(response.body).toHaveProperty('total');
  expect(response.body).toHaveProperty('page');
  expect(response.body).toHaveProperty('pageSize');
  expect(response.body).toHaveProperty('totalPages');
}
