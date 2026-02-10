# VakSpot

## Overview
A minimalistic Dutch marketplace connecting clients with tradespeople (vakmensen). Clients post jobs, PROs in the area express interest, they message, and get work done. Built as a Next.js web application with Prisma ORM, NextAuth authentication, Stripe payments, and Vercel deployment.

## Tech Stack
- Language: TypeScript (strict mode)
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL via Prisma ORM
- Auth: NextAuth v5 (beta) with Prisma adapter
- Payments: Stripe (checkout + webhooks + iDEAL)
- File storage: Vercel Blob
- Email: Resend
- Styling: Tailwind CSS
- Testing: Vitest (unit) + Playwright (e2e)
- Linting: ESLint (next config) + Prettier
- Deployment: Vercel
- Package manager: npm

## Architecture

Next.js App Router with route groups:

```
src/
├── app/
│   ├── (auth)/          # Login, register (client + pro)
│   ├── (dashboard)/     # Client and PRO dashboards
│   │   ├── client/      # Job posting, management, messages
│   │   └── pro/         # Job discovery, swipe, services, messages
│   ├── api/             # API routes (REST endpoints)
│   │   ├── auth/        # NextAuth handlers
│   │   ├── bids/        # Interest/bid system
│   │   ├── jobs/        # Job CRUD
│   │   ├── messages/    # Chat system
│   │   ├── quotes/      # Quote system
│   │   ├── reviews/     # Review system
│   │   ├── reports/     # Content reporting (DSA)
│   │   ├── stripe/      # Payment checkout + webhooks
│   │   ├── admin/       # Admin routes (analytics, users, reports)
│   │   └── cron/        # Vercel cron jobs (job status transitions)
│   └── [public pages]   # Landing, FAQ, terms, privacy, ranking, etc.
├── components/
│   ├── layout/          # Header, footer, navigation
│   ├── ui/              # Reusable UI components
│   └── quotes/          # Quote form and card components
├── lib/                 # Shared utilities
│   ├── prisma.ts        # Prisma client singleton
│   ├── auth.ts          # NextAuth config
│   ├── email.ts         # Resend email templates
│   ├── stripe.ts        # Stripe config
│   ├── geo.ts           # Postal code geo-lookup (PC4)
│   └── job-state-machine.ts  # Job status transition validation
├── middleware.ts         # Auth middleware (route protection)
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

### Key Domain Concepts
- **Jobs** have a 15-status lifecycle managed by a state machine (`lib/job-state-machine.ts`)
- **Bids/Interest** — PROs express interest, clients accept one, others auto-rejected
- **Quotes** — PROs can send formal quotes with amount, description, validity
- **StatusHistory** — Audit trail for every job status transition
- **Roles** — CLIENT, PROFESSIONAL, ADMIN (via `userRole` enum)
- **ProProfile** — Extends User with KvK number, categories, entity type, work radius
- **Distance filtering** — PC4-based geo-lookup for job proximity

### Data Flow
```
Client posts job → CREATED (auto-published)
  → PRO interest → RESPONSES_RECEIVED (auto)
  → Messages → IN_CONVERSATION (auto)
  → Optional quote → QUOTE_RECEIVED (auto)
  → Client accepts PRO → SELECTED
  → PRO sets date → SCHEDULED
  → Date arrives → IN_PROGRESS (cron auto)
  → Done → COMPLETED_BY_CONSUMER / COMPLETED_BY_PRO
  → Review → REVIEWED
```

Cancellation, no-match, and expiry statuses handled via cron job (`api/cron/job-transitions/`).

## Key Conventions
- Path aliases: `@/*` maps to `src/*`
- API routes return JSON with consistent error shapes
- Form validation with Zod schemas + react-hook-form
- Server-side auth checks via `auth()` from NextAuth
- UI components use Tailwind + clsx + tailwind-merge
- Icons via lucide-react
- All prices in cents (Stripe convention)
- Dutch language in user-facing content, English in code
- Prisma schema is the single source of truth for data model
- Status transitions must go through `lib/job-state-machine.ts` — never set status directly

## Engineering Standards

### Test-Driven Development (Strict TDD)

This project follows strict TDD. The workflow is ALWAYS:

1. **Design tests first** based on the specification
2. **Freeze the tests** — once written, tests are NOT modified to make them pass
3. **Write code** that makes the frozen tests pass
4. **Refactor** only after all tests are green

The test suite is the specification. If code doesn't pass the tests, the code is wrong — not the tests.

#### Test Structure
- Unit tests: `tests/unit/` — mirror the src/ structure
- E2E tests: `tests/e2e/` — Playwright browser tests
- Test setup: `tests/setup.ts`
- Coverage target: 90% minimum
- Tests must be deterministic — no flaky tests, no timing dependencies

#### Test Naming
- `test_[function]_[scenario]_[expected_result]` or `it('should [behavior] when [condition]')`

### Security
- Never hardcode secrets, API keys, tokens, or credentials anywhere
- All secrets via environment variables (.env.local, Vercel env vars)
- Validate and sanitize ALL external input with Zod schemas
- Use Prisma parameterized queries — never raw SQL with string interpolation
- Apply principle of least privilege: minimal permissions, minimal data exposure
- Log security-relevant events (auth failures, permission denials)
- All API endpoints require authentication unless explicitly public
- Dependencies pinned in package-lock.json
- Stripe webhooks verified with signature validation
- NextAuth CSRF protection enabled

### Scalability
- Prisma connection pooling (Vercel serverless-friendly)
- Pagination on all list endpoints
- Vercel cron jobs for async status transitions (not in-request)
- No in-memory state — everything in PostgreSQL
- Images via Vercel Blob (not filesystem)

### Code Quality
- TypeScript strict mode — no `any` unless absolutely justified
- Zod schemas for all external input validation
- Explicit error handling — no silent failures
- Functions do one thing, components render one concern
- Dead code deleted, not commented out
- No TODO comments in merged code

## NEVER Do
- NEVER modify test assertions to make tests pass — fix the code instead
- NEVER skip or disable tests to get a green build
- NEVER hardcode API keys, tokens, passwords, or any secret
- NEVER bypass the job state machine — always use `transitionJobStatus()` from `lib/job-state-machine.ts`
- NEVER set job status directly in Prisma — go through the state machine
- NEVER catch broad exceptions without re-throwing or logging
- NEVER add npm dependencies without checking if an existing one covers the use case
- NEVER store sensitive data in logs or client-side storage
- NEVER commit .env files or credentials
- NEVER use `any` type without a comment justifying why
- NEVER use string concatenation for SQL — use Prisma's query builder
- NEVER write code without tests first (TDD is non-negotiable)
- NEVER merge without the full test suite passing
- NEVER assume external input is safe — validate with Zod
- NEVER modify the Prisma schema without creating a migration
- NEVER break existing API contracts without updating all consumers
- NEVER use `dangerouslySetInnerHTML` without sanitization
- NEVER skip Stripe webhook signature verification

## Common Commands
- `npm run dev` — Start Next.js dev server
- `npm test` — Run Vitest unit tests
- `npm run test:coverage` — Tests with coverage report
- `npm run test:e2e` — Playwright end-to-end tests
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run build` — Production build
- `npx prisma migrate dev` — Create + apply migration
- `npx prisma db push` — Push schema changes (no migration)
- `npx prisma generate` — Regenerate Prisma client
- `npx prisma studio` — Visual database browser
- `npx prisma db seed` — Seed database

## Current Status
<!-- Update this section at the end of each work session -->
- [x] Phase 1-3: Core simplification complete
- [x] Phase 4: Polish complete
- [x] Phase 5: Feature enhancements complete (chat, location, filtering, payments)
- [x] Phase 6: Legal & compliance (DSA, P2B, GDPR) complete
- [x] Phase 7: Job status lifecycle (15-status state machine) complete
- [x] 0 open bugs
- [ ] Refactoring and code quality improvements needed
- [ ] Test coverage needs expansion
