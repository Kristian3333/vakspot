# VakSpot Build Plan
## A Minimal, Test-Driven Home Services Marketplace

> **Philosophy**: Build the smallest thing that works, test it, then iterate.

---

## Tech Stack (Final)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | Best Vercel integration |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid prototyping |
| Auth | NextAuth.js v5 | Flexible, self-hosted |
| Database | PostgreSQL (Neon) | Serverless-friendly |
| ORM | Prisma | Type-safe queries |
| File Storage | Vercel Blob | Simple, integrated |
| Email | Resend | Modern, developer-friendly |
| Testing | Vitest + Playwright | Fast unit + E2E |

---

## Current Progress

### ✅ Phase 0: Project Scaffolding - COMPLETE
- [x] Initialize Next.js 14 with TypeScript
- [x] Configure Tailwind CSS with custom theme
- [x] Set up project structure
- [x] Configure environment variables template
- [x] Initialize Vitest for testing
- [x] Create base layout and theme

### ✅ Phase 1: Auth & Role System - COMPLETE
- [x] NextAuth.js v5 configuration
- [x] User model with roles (CLIENT, PRO, ADMIN)
- [x] Login page
- [x] Client registration page
- [x] Pro registration page (multi-step)
- [x] Role-based middleware
- [x] Auth API routes

### ✅ Phase 2: Database Schema & Prisma - COMPLETE
- [x] Complete Prisma schema with all models
- [x] Seed file with categories and test data
- [x] Type definitions
- [x] Validation schemas with Zod
- [ ] Database connection (requires env vars)

### ✅ Phase 3: Job Posting (Customer Flow) - COMPLETE
- [x] Multi-step job posting form
- [x] Image upload component
- [x] Job listing page (client dashboard)
- [x] Job detail page
- [x] Jobs API route (CRUD)
- [x] Upload API route

### ✅ Phase 4: Pro Dashboard & Bidding - COMPLETE
- [x] Pro leads feed page
- [x] Lead detail page
- [x] Lead filters (category, distance)
- [x] Leads API route
- [x] Bids API route
- [x] Bid form component

### 🔄 Phase 5-10: Partial/Not Started
- [ ] Matching algorithm (basic structure exists)
- [ ] Email notifications
- [ ] In-app messaging
- [ ] Reviews system
- [ ] Admin panel
- [ ] Polish & deploy

---

## File Structure

```
vakspot/
├── prisma/
│   ├── schema.prisma          # Complete DB schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/
│   │   │       ├── page.tsx   # Client registration
│   │   │       └── pro/page.tsx # Pro registration
│   │   ├── (dashboard)/
│   │   │   ├── client/
│   │   │   │   └── jobs/
│   │   │   │       ├── page.tsx     # Job list
│   │   │   │       ├── new/page.tsx # Create job
│   │   │   │       └── [id]/page.tsx # Job detail
│   │   │   └── pro/
│   │   │       └── leads/
│   │   │           ├── page.tsx     # Leads feed
│   │   │           └── [id]/page.tsx # Lead detail
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── jobs/route.ts
│   │   │   ├── jobs/[id]/route.ts
│   │   │   ├── leads/route.ts
│   │   │   └── bids/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Button, Input, Card, etc.
│   │   ├── layout/            # Header, Footer
│   │   ├── forms/             # JobForm
│   │   └── jobs/              # JobCard
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utilities
│   │   └── validations.ts     # Zod schemas
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── styles/
│   │   └── globals.css        # Tailwind + custom CSS
│   └── middleware.ts          # Auth middleware
├── tests/
│   ├── unit/utils.test.ts
│   └── setup.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## To Run the Project

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database
npm run db:push

# 5. Seed the database
npm run db:seed

# 6. Run development server
npm run dev
```

---

## Environment Variables Required

```env
# Database (Neon recommended)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# Email (Resend) - optional for MVP
RESEND_API_KEY="..."
```

---

## What Works Now

1. **Landing Page**: Hero, categories, how-it-works, CTA sections
2. **Authentication**: Login, register (client & pro), role-based redirects
3. **Client Flow**: 
   - Post jobs with multi-step form
   - Upload images
   - View job list and details
   - See incoming bids
4. **Pro Flow**:
   - View available leads
   - Filter by category and distance
   - View lead details
   - Submit bids

---

## What Needs Work

1. **Messaging**: Basic structure exists but needs UI
2. **Reviews**: Schema exists, needs UI and API
3. **Admin Panel**: Not started
4. **Email Notifications**: Not connected
5. **Matching Algorithm**: Basic scoring exists, needs refinement
6. **Tests**: Only utils.test.ts exists

---

## Success Criteria for MVP

- [x] Users can register as client or pro
- [x] Clients can post jobs with images
- [x] Pros see relevant jobs in their feed
- [x] Pros can bid on jobs
- [ ] Clients can compare bids and accept one
- [ ] Both parties can message each other
- [ ] Clients can leave reviews
- [ ] Admin can manage categories

---

## Last Updated

**Date**: 2025-01-20  
**Status**: ~70% complete - Core flows working
