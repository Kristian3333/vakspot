# VakSpot 🔧

A minimalistic Dutch marketplace connecting homeowners with local tradespeople.

**Live**: [vakspot.vercel.app](https://vakspot.vercel.app)

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Client                                                    │
│   ───────                                                   │
│   1. Posts a job (title, description, location, photos)     │
│   2. Receives interest from local PROs                      │
│   3. Messages with interested PROs                          │
│   4. Picks someone and gets the job done                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   PRO (Tradesperson)                                        │
│   ─────────────────                                         │
│   1. Browses jobs in their area & categories                │
│   2. Clicks "I'm interested" on relevant jobs               │
│   3. Messages with the client                               │
│   4. Gets hired and does the work                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

No complex bidding. No price competition. Just simple matchmaking.

---

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
| Deployment | Vercel |

---

## Quick Start

```bash
# Install
npm install

# Environment
cp .env.example .env.local
# Edit .env.local with your database + auth secrets

# Database
npm run db:generate
npm run db:push
npm run db:seed

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."
```

---

## Test Accounts

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Client | klant@test.nl | client123 |
| PRO | schilder@test.nl | pro123 |
| Admin | admin@vakspot.nl | admin123 |

---

## Project Structure

```
vakspot/
├── prisma/
│   └── schema.prisma      # Database models
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login, Register
│   │   ├── (dashboard)/
│   │   │   ├── client/    # Client: post jobs, view jobs
│   │   │   ├── pro/       # PRO: browse jobs, profile
│   │   │   └── messages/  # Messaging for both
│   │   ├── api/           # API routes
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── forms/         # Job form, interest form
│   │   ├── layout/        # Header, Footer
│   │   ├── messages/      # Chat UI
│   │   └── ui/            # Buttons, inputs, cards
│   └── lib/
│       ├── auth.ts        # NextAuth config
│       ├── prisma.ts      # Database client
│       └── validations.ts # Zod schemas
└── public/                # Static assets
```

---

## Scripts

```bash
npm run dev          # Development
npm run build        # Production build
npm run db:studio    # Prisma Studio (DB GUI)
npm run db:seed      # Seed test data
```

---

## Roadmap

See [TODO.md](./TODO.md) for the current simplification plan.

**Core Principles:**
- Keep it simple
- Mobile-first
- Fast to post, fast to respond
- No unnecessary features

---

## License

MIT
