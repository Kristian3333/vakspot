# VakSpot 🔧

A modern home services marketplace connecting homeowners with skilled tradespeople. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **For Homeowners (Clients)**
  - Post jobs with photos and detailed descriptions
  - Receive and compare bids from professionals
  - In-app messaging with tradespeople
  - Leave reviews after job completion

- **For Professionals (Pros)**
  - Browse available leads in your area
  - Filter by category, distance, and budget
  - Submit competitive bids
  - Build reputation through reviews

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon/Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **File Storage**: Vercel Blob
- **Deployment**: Vercel

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd vakspot

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

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Test Accounts

After seeding, you can log in with these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vakspot.nl | admin123 |
| Client | klant@test.nl | client123 |
| Pro | schilder@test.nl | pro123 |
| Pro | loodgieter@test.nl | pro123 |
| Pro | elektricien@test.nl | pro123 |

## Project Structure

```
vakspot/
├── prisma/              # Database schema and seeds
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── lib/           # Utilities, auth, prisma
│   └── types/         # TypeScript definitions
├── tests/             # Unit and E2E tests
└── public/            # Static assets
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Your app URL
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (optional)
- `RESEND_API_KEY` - Email service (optional)

## Deployment

This project is optimized for Vercel:

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## License

MIT
