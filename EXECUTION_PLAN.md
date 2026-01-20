# VakSpot MVP Execution Plan
> Minimal, Test-Driven Home Services Marketplace

**Goal**: Build a working marketplace where clients post jobs, pros bid, and they can communicate.

---

## Current Status

### ✅ Completed (Phase 0)
- [x] Project structure created
- [x] package.json with dependencies
- [x] Tailwind + PostCSS config
- [x] TypeScript config
- [x] Prisma schema defined
- [x] Seed data script
- [x] Utility functions (cn, formatCurrency, calculateDistance, etc.)
- [x] Validation schemas (Zod)
- [x] Type definitions
- [x] UI Components (Button, Input, Card, Badge, Avatar, Select, Spinner)
- [x] Layout components (Header, Footer)
- [x] Root layout with fonts
- [x] Landing page
- [x] Login page
- [x] Register page (client)
- [x] Auth API routes (NextAuth + register)

### 🔄 In Progress (Phase 1)
- [ ] Install dependencies and verify build
- [ ] Set up test framework
- [ ] Create environment files

---

## Execution Phases

### Phase 1: Foundation & Tests Setup
**Time: 30 mins | Priority: CRITICAL**

```
Tasks:
1. Create .env.example with all required vars
2. Create vitest.config.ts
3. Create test setup files
4. Verify npm install works
5. Create first smoke test
```

**Checkpoint**: `npm run test` passes

---

### Phase 2: Database & Seed
**Time: 30 mins | Priority: CRITICAL**

```
Tasks:
1. Verify Prisma schema compiles
2. Add database connection test
3. Test seed script structure
```

**Checkpoint**: Schema generates without errors

---

### Phase 3: Auth Flow Complete
**Time: 45 mins | Priority: HIGH**

```
Tasks:
1. Complete pro registration page
2. Add middleware for protected routes
3. Create auth tests
```

**Files needed:**
- src/app/(auth)/register/pro/page.tsx
- src/middleware.ts
- tests/unit/auth.test.ts

**Checkpoint**: Can register/login as client and pro

---

### Phase 4: Job CRUD (Client Side)
**Time: 1 hour | Priority: HIGH**

```
Tasks:
1. Job listing page (client dashboard)
2. Create job form (multi-step)
3. Job detail page
4. Job API routes
5. Image upload API
```

**Files needed:**
- src/app/(dashboard)/client/jobs/page.tsx
- src/app/(dashboard)/client/jobs/new/page.tsx
- src/app/(dashboard)/client/jobs/[id]/page.tsx
- src/app/api/jobs/route.ts
- src/app/api/jobs/[id]/route.ts
- src/app/api/upload/route.ts
- src/components/forms/job-form.tsx
- tests/unit/jobs.test.ts

**Checkpoint**: Client can create and view jobs

---

### Phase 5: Pro Dashboard & Bidding
**Time: 1 hour | Priority: HIGH**

```
Tasks:
1. Pro onboarding completion check
2. Leads feed (matching jobs)
3. Bid submission form
4. My bids page
5. Bid API routes
```

**Files needed:**
- src/app/(dashboard)/pro/leads/page.tsx
- src/app/(dashboard)/pro/leads/[id]/page.tsx
- src/app/(dashboard)/pro/bids/page.tsx
- src/app/api/leads/route.ts
- src/app/api/bids/route.ts
- src/components/forms/bid-form.tsx
- src/lib/matching.ts
- tests/unit/matching.test.ts

**Checkpoint**: Pro can view leads and submit bids

---

### Phase 6: Bid Management & Acceptance
**Time: 45 mins | Priority: HIGH**

```
Tasks:
1. Show bids on job detail (client view)
2. Accept/reject bid functionality
3. Update job status on acceptance
4. Bid status updates
```

**Files needed:**
- src/components/bids/bid-card.tsx
- src/components/bids/bid-list.tsx
- src/app/api/bids/[id]/route.ts
- src/app/api/bids/[id]/accept/route.ts

**Checkpoint**: Client can accept a bid, job status updates

---

### Phase 7: Messaging
**Time: 1 hour | Priority: MEDIUM**

```
Tasks:
1. Create conversation on bid
2. Messages list page
3. Chat interface
4. Message API routes
5. Polling for new messages
```

**Files needed:**
- src/app/(dashboard)/messages/page.tsx
- src/app/(dashboard)/messages/[id]/page.tsx
- src/app/api/messages/route.ts
- src/app/api/conversations/[id]/messages/route.ts
- src/components/chat/conversation-list.tsx
- src/components/chat/chat-window.tsx

**Checkpoint**: Users can send/receive messages

---

### Phase 8: Reviews
**Time: 30 mins | Priority: MEDIUM**

```
Tasks:
1. Review form (after job completion)
2. Display reviews on pro profile
3. Calculate average rating
4. Review API routes
```

**Files needed:**
- src/app/(dashboard)/client/jobs/[id]/review/page.tsx
- src/app/api/reviews/route.ts
- src/components/reviews/review-form.tsx
- src/components/reviews/review-card.tsx

**Checkpoint**: Client can leave review, ratings update

---

### Phase 9: Admin Panel
**Time: 45 mins | Priority: LOW**

```
Tasks:
1. Admin dashboard
2. Category management
3. User list
4. Basic moderation
```

**Files needed:**
- src/app/(dashboard)/admin/page.tsx
- src/app/(dashboard)/admin/categories/page.tsx
- src/app/(dashboard)/admin/users/page.tsx
- src/app/api/admin/categories/route.ts

**Checkpoint**: Admin can manage categories and users

---

### Phase 10: Polish & Deploy
**Time: 1 hour | Priority: LOW**

```
Tasks:
1. Error boundaries
2. Loading states
3. SEO metadata
4. Environment validation
5. Production build test
```

**Checkpoint**: `npm run build` succeeds, app is deployable

---

## File Checklist

### Config Files
- [x] package.json
- [x] tsconfig.json
- [x] tailwind.config.ts
- [x] postcss.config.mjs
- [x] next.config.mjs
- [ ] .env.example
- [ ] vitest.config.ts
- [ ] playwright.config.ts

### Prisma
- [x] prisma/schema.prisma
- [x] prisma/seed.ts

### Lib
- [x] src/lib/prisma.ts
- [x] src/lib/auth.ts
- [x] src/lib/utils.ts
- [x] src/lib/validations.ts
- [ ] src/lib/matching.ts

### Types
- [x] src/types/index.ts

### UI Components
- [x] src/components/ui/button.tsx
- [x] src/components/ui/input.tsx
- [x] src/components/ui/card.tsx
- [x] src/components/ui/badge.tsx
- [x] src/components/ui/select.tsx
- [x] src/components/ui/avatar.tsx
- [x] src/components/ui/spinner.tsx
- [x] src/components/ui/index.ts

### Layout Components
- [x] src/components/layout/header.tsx
- [x] src/components/layout/footer.tsx
- [x] src/components/layout/index.ts

### Form Components
- [ ] src/components/forms/job-form.tsx
- [ ] src/components/forms/bid-form.tsx

### Feature Components
- [ ] src/components/jobs/job-card.tsx
- [ ] src/components/jobs/job-list.tsx
- [ ] src/components/bids/bid-card.tsx
- [ ] src/components/bids/bid-list.tsx
- [ ] src/components/chat/conversation-list.tsx
- [ ] src/components/chat/chat-window.tsx
- [ ] src/components/reviews/review-form.tsx
- [ ] src/components/reviews/review-card.tsx

### Pages
- [x] src/app/layout.tsx
- [x] src/app/page.tsx
- [x] src/app/(auth)/login/page.tsx
- [x] src/app/(auth)/register/page.tsx
- [ ] src/app/(auth)/register/pro/page.tsx
- [ ] src/app/(dashboard)/client/jobs/page.tsx
- [ ] src/app/(dashboard)/client/jobs/new/page.tsx
- [ ] src/app/(dashboard)/client/jobs/[id]/page.tsx
- [ ] src/app/(dashboard)/client/jobs/[id]/review/page.tsx
- [ ] src/app/(dashboard)/pro/leads/page.tsx
- [ ] src/app/(dashboard)/pro/leads/[id]/page.tsx
- [ ] src/app/(dashboard)/pro/bids/page.tsx
- [ ] src/app/(dashboard)/pro/profile/page.tsx
- [ ] src/app/(dashboard)/messages/page.tsx
- [ ] src/app/(dashboard)/messages/[id]/page.tsx
- [ ] src/app/(dashboard)/admin/page.tsx
- [ ] src/app/(dashboard)/admin/categories/page.tsx
- [ ] src/app/(dashboard)/admin/users/page.tsx

### API Routes
- [x] src/app/api/auth/[...nextauth]/route.ts
- [x] src/app/api/auth/register/route.ts
- [ ] src/app/api/jobs/route.ts
- [ ] src/app/api/jobs/[id]/route.ts
- [ ] src/app/api/leads/route.ts
- [ ] src/app/api/bids/route.ts
- [ ] src/app/api/bids/[id]/route.ts
- [ ] src/app/api/bids/[id]/accept/route.ts
- [ ] src/app/api/messages/route.ts
- [ ] src/app/api/conversations/[id]/messages/route.ts
- [ ] src/app/api/reviews/route.ts
- [ ] src/app/api/upload/route.ts
- [ ] src/app/api/admin/categories/route.ts

### Middleware
- [ ] src/middleware.ts

### Tests
- [ ] vitest.config.ts
- [ ] tests/setup.ts
- [ ] tests/unit/utils.test.ts
- [ ] tests/unit/auth.test.ts
- [ ] tests/unit/jobs.test.ts
- [ ] tests/unit/matching.test.ts

---

## Environment Variables Required

```env
# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# File Upload (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# Email (Resend) - Optional for MVP
RESEND_API_KEY="..."

# App
NODE_ENV="development"
```

---

## Quick Commands

```bash
# Install
npm install

# Development
npm run dev

# Database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB
npm run db:seed       # Seed initial data
npm run db:studio     # Open Prisma Studio

# Testing
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests

# Build
npm run build
npm run start
```

---

## Success Metrics

MVP is complete when:
1. ✅ User can register as client or pro
2. ⬜ Client can post a job with description and images
3. ⬜ Pro sees matching jobs in their feed
4. ⬜ Pro can submit a bid with price and message
5. ⬜ Client can view and compare bids
6. ⬜ Client can accept a bid
7. ⬜ Both parties can message each other
8. ⬜ Client can leave a review after completion
9. ⬜ All tests pass
10. ⬜ Build succeeds

---

## Current Session Progress

**Started**: Phase 1 - Foundation & Tests Setup
**Last Updated**: [timestamp]

### Next Actions:
1. Create .env.example
2. Create vitest.config.ts  
3. Create middleware.ts
4. Create pro registration page
5. Create job-related pages and APIs
