# VakSpot 🔧

A modern Dutch home services marketplace connecting homeowners with skilled tradespeople. Similar to Werkspot, built with Next.js 14, TypeScript, and Tailwind CSS.

**Live**: [vakspot.vercel.app](https://vakspot.vercel.app)

## What It Does

**For Homeowners (Clients)**
- Post jobs with photos and detailed descriptions
- Receive and compare bids from professionals
- In-app messaging with tradespeople
- Leave reviews after job completion

**For Professionals (Pros)**
- Browse available leads in your area
- Filter by category, distance, and budget
- Submit competitive bids
- Build reputation through reviews

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| File Storage | Vercel Blob |
| Email | Resend |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

## Project Structure

```
vakspot/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & registration pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   │       ├── page.tsx   # Client registration
│   │   │       └── pro/       # Pro registration
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── client/        # Client dashboard
│   │   │   │   └── jobs/      # Job management
│   │   │   ├── messages/      # Messaging
│   │   │   └── pro/           # Pro dashboard
│   │   │       ├── bids/      # Bid management
│   │   │       ├── leads/     # Lead browsing
│   │   │       └── profile/   # Pro profile
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── bids/          # Bid CRUD
│   │   │   ├── categories/    # Category API
│   │   │   ├── jobs/          # Job CRUD
│   │   │   ├── leads/         # Leads API
│   │   │   ├── messages/      # Messages API
│   │   │   ├── reviews/       # Reviews API
│   │   │   └── upload/        # File upload
│   │   ├── categories/        # Category browser
│   │   ├── contact/           # Contact page
│   │   ├── cookies/           # Cookie policy
│   │   ├── faq/               # FAQ page
│   │   ├── help/              # Help center
│   │   ├── how-it-works/      # How it works
│   │   ├── privacy/           # Privacy policy
│   │   ├── profile/           # User profile
│   │   ├── settings/          # User settings
│   │   ├── terms/             # Terms of service
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── bids/              # Bid components
│   │   ├── forms/             # Job form, bid form
│   │   ├── jobs/              # Job cards & lists
│   │   ├── layout/            # Header, Footer
│   │   ├── messages/          # Chat components
│   │   └── ui/                # Button, Input, Card, etc.
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utilities
│   │   └── validations.ts     # Zod schemas
│   ├── types/                 # TypeScript types
│   ├── styles/                # Global styles
│   └── middleware.ts          # Auth middleware
├── tests/
│   ├── unit/
│   └── setup.ts
└── public/                    # Static assets
```

## Current Status: ~85% Complete

### ✅ Completed Features
- **Auth System**: Login, client registration, pro registration (multi-step), role-based middleware
- **Client Flow**: Post jobs with multi-step form, image upload, job listing, job details, view incoming bids
- **Pro Flow**: Browse leads, filter by category/distance, lead details, submit bids, manage bids
- **Messaging**: Basic message system with conversations
- **Reviews**: Review submission system
- **Admin Panel**: Basic admin dashboard
- **Static Pages**: All footer links working (how-it-works, categories, contact, FAQ, help, privacy, terms, cookies)
- **Profile & Settings**: User profile and settings pages

### API Routes
All core API routes are implemented:
- `/api/auth/*` - Authentication (NextAuth + custom register/signout)
- `/api/jobs` - Job CRUD operations
- `/api/leads` - Leads for pros
- `/api/bids` - Bid management
- `/api/categories` - Category listing
- `/api/messages` - Messaging
- `/api/reviews` - Review submission
- `/api/upload` - File uploads

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Database (Neon recommended)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# Email (Resend) - optional for MVP
RESEND_API_KEY="..."
```

## Test Accounts

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vakspot.nl | admin123 |
| Client | klant@test.nl | client123 |
| Pro | schilder@test.nl | pro123 |
| Pro | loodgieter@test.nl | pro123 |
| Pro | elektricien@test.nl | pro123 |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run test         # Unit tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio
```

## Deployment

Optimized for Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## License

MIT
