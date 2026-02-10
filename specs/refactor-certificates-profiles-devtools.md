# VakSpot Refactor: Certificates, Profiles, Status UI, Dev Tools & Tests

## Objective

Six features plus comprehensive test coverage for the entire codebase. This plan
is designed for agent team execution with strict file ownership per stream.

---

## Context Summary

**Current state of the codebase:**
- Prisma schema: 20+ models, 15-status job lifecycle, state machine in `lib/job-state-machine.ts`
- Test coverage: **1 file** (`tests/unit/utils.test.ts`) — effectively zero coverage
- PRO profile page: `src/app/(dashboard)/pro/profile/page.tsx` — shows werkgebied then specialisaties
- Client profile: exists at `/profile` but is private (own view only), no public profile page
- Job completion flow: state machine supports it, UI has ProJobStepper, but unclear if all paths work end-to-end
- Dutch pluralization bug in `src/lib/utils.ts`: `formatRelativeTime` appends "en" naively, producing "minuuten", "uuren", "jaaren", "weeken" instead of correct Dutch plurals
- Platform address: not currently shown as PO box anywhere specific
- Dev tools: none — testing requires logging in/out as different users manually

---

## Work Streams

### Stream 1: Schema, Migrations & Core Logic

**Owner:** builder-schema  
**Files (EXCLUSIVE):**
- `prisma/schema.prisma`
- `prisma/seed.ts` (if exists)
- `src/lib/certificates.ts` (NEW)
- `src/lib/utils.ts`
- `src/types/certificates.ts` (NEW)
- `tests/unit/certificates.test.ts` (NEW)
- `tests/unit/utils.test.ts` (UPDATE existing)

**Depends on:** Nothing (runs first)

#### Tasks

**1.1 — Fix Dutch pluralization bug**

The current `formatRelativeTime` in `src/lib/utils.ts` does this:
```typescript
const plural = count > 1 && interval.label !== 'maand' ? 'en' : '';
return `${count} ${interval.label}${plural} geleden`;
```

This produces: "2 minuuten", "2 uuren", "3 jaaren", "2 weeken" — all wrong.

Correct Dutch plurals:
| Singular | Plural | Rule |
|----------|--------|------|
| minuut | minuten | Drop the doubled vowel |
| uur | uur | No plural form |
| dag | dagen | Add "en" |
| week | weken | Add "en" |
| maand | maanden | Add "en" |
| jaar | jaar | No plural form |

Replace the intervals array with explicit singular/plural forms:
```typescript
const intervals = [
  { singular: 'jaar',   plural: 'jaar',     seconds: 31536000 },
  { singular: 'maand',  plural: 'maanden',  seconds: 2592000 },
  { singular: 'week',   plural: 'weken',    seconds: 604800 },
  { singular: 'dag',    plural: 'dagen',    seconds: 86400 },
  { singular: 'uur',    plural: 'uur',      seconds: 3600 },
  { singular: 'minuut', plural: 'minuten',  seconds: 60 },
];
```

Then: `return \`${count} ${count === 1 ? interval.singular : interval.plural} geleden\`;`

Write tests first in `tests/unit/utils.test.ts` (extend the existing file):
- `it('should say "10 minuten geleden" not "10 minuuten geleden"')`
- `it('should say "2 uur geleden" not "2 uuren geleden"')`
- `it('should say "3 jaar geleden" not "3 jaaren geleden"')`
- `it('should say "2 weken geleden" not "2 weeken geleden"')`
- `it('should say "2 maanden geleden"')`
- `it('should say "1 minuut geleden"')` (singular)
- `it('should say "1 dag geleden"')` (singular)

**1.2 — Certificate/Accreditation Prisma model**

Add to `prisma/schema.prisma`:

```prisma
// ============================================
// CERTIFICATES & ACCREDITATIONS
// ============================================

model CertificateType {
  id            String   @id @default(cuid())
  code          String   @unique    // Internal code: "VCA_BASIC", "NEN_1010", "INSTALLQ", etc.
  name          String              // Display name: "VCA Basisveiligheid"
  category      CertificateCategory
  description   String?  @db.Text   // What this cert means
  clientLabel   String              // What clients see: "Gecertificeerd veiligheidsexpert (VCA)"
  requiredHours Int?                // e.g., 120 for certain accreditations
  validityYears Int?                // How long cert is valid (null = permanent)
  active        Boolean  @default(true)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  proCertificates ProCertificate[]

  @@index([code])
  @@index([category])
  @@index([active, order])
}

enum CertificateCategory {
  SAFETY          // VCA, BHV
  ELECTRICAL      // NEN 1010, NEN 3140
  INSTALLATION    // InstallQ, Uneto-VNI
  EDUCATION       // MBO, HBO, WO degrees
  CONSTRUCTION    // Bouwveiligheid, asbestverwijdering
  GENERAL         // Other certifications
}

model ProCertificate {
  id                String            @id @default(cuid())
  proId             String
  pro               ProProfile        @relation(fields: [proId], references: [id], onDelete: Cascade)
  certificateTypeId String
  certificateType   CertificateType   @relation(fields: [certificateTypeId], references: [id])
  
  // Verification
  status            CertificateStatus @default(PENDING)
  verifiedAt        DateTime?
  expiresAt         DateTime?         // Calculated from certificateType.validityYears + issuedAt
  issuedAt          DateTime?         // When the cert was originally issued
  
  // Verification data
  certificateNumber String?           // External cert number for verification
  issuingBody       String?           // Who issued it (e.g., "PBNA", "Technische Universiteit Delft")
  verificationEmail String?           // Email sent to for verification
  verificationToken String?           // Token for email verification link
  verificationSentAt DateTime?        // When verification email was sent
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@unique([proId, certificateTypeId])  // One cert of each type per PRO
  @@index([proId])
  @@index([certificateTypeId])
  @@index([status])
  @@index([expiresAt])
}

enum CertificateStatus {
  PENDING     // Awaiting verification
  VERIFIED    // Email verification completed
  EXPIRED     // Past expiry date
  REJECTED    // Verification failed
}
```

Add relation to ProProfile:
```prisma
model ProProfile {
  // ... existing fields ...
  certificates  ProCertificate[]  // ADD this line after servicePurchases
}
```

**1.3 — Seed data for certificate types**

Create or update `prisma/seed.ts` to include the standard Dutch trade certifications:

```typescript
const certificateTypes = [
  // Safety
  { code: 'VCA_BASIC', name: 'VCA Basisveiligheid', category: 'SAFETY', clientLabel: 'Gecertificeerd veiligheidsexpert (VCA Basis)', requiredHours: 8, validityYears: 10, order: 1 },
  { code: 'VCA_VOL', name: 'VCA Vol', category: 'SAFETY', clientLabel: 'Volledig veiligheidsgecertificeerd (VCA Vol)', requiredHours: 32, validityYears: 10, order: 2 },
  { code: 'BHV', name: 'BHV Certificaat', category: 'SAFETY', clientLabel: 'Bedrijfshulpverlener (BHV)', requiredHours: 16, validityYears: 1, order: 3 },
  
  // Electrical
  { code: 'NEN_1010', name: 'NEN 1010', category: 'ELECTRICAL', clientLabel: 'Gecertificeerd elektricien (NEN 1010)', requiredHours: 120, validityYears: null, order: 10 },
  { code: 'NEN_3140', name: 'NEN 3140', category: 'ELECTRICAL', clientLabel: 'Bevoegd elektrotechnisch medewerker (NEN 3140)', requiredHours: 40, validityYears: null, order: 11 },
  
  // Installation
  { code: 'INSTALLQ', name: 'InstallQ Vakbekwaamheid', category: 'INSTALLATION', clientLabel: 'Erkend installateur (InstallQ)', requiredHours: null, validityYears: 5, order: 20 },
  { code: 'UNETO_VNI', name: 'Uneto-VNI Lid', category: 'INSTALLATION', clientLabel: 'Lid branchevereniging Techniek Nederland', requiredHours: null, validityYears: 1, order: 21 },
  
  // Education
  { code: 'MBO_2', name: 'MBO Niveau 2', category: 'EDUCATION', clientLabel: 'Vakbekwaam (MBO-2 diploma)', requiredHours: null, validityYears: null, order: 30 },
  { code: 'MBO_3', name: 'MBO Niveau 3', category: 'EDUCATION', clientLabel: 'Allround vakman (MBO-3 diploma)', requiredHours: null, validityYears: null, order: 31 },
  { code: 'MBO_4', name: 'MBO Niveau 4', category: 'EDUCATION', clientLabel: 'Gespecialiseerd vakman (MBO-4 diploma)', requiredHours: null, validityYears: null, order: 32 },
  { code: 'HBO', name: 'HBO Diploma', category: 'EDUCATION', clientLabel: 'HBO-opgeleid specialist', requiredHours: null, validityYears: null, order: 33 },
  
  // Construction
  { code: 'ASBEST_SC530', name: 'Asbestverwijdering SC-530', category: 'CONSTRUCTION', clientLabel: 'Gecertificeerd asbestverwijderaar', requiredHours: 32, validityYears: 3, order: 40 },
  { code: 'DTA', name: 'Deskundig Toezichthouder Asbest', category: 'CONSTRUCTION', clientLabel: 'Deskundig asbest-toezichthouder (DTA)', requiredHours: 40, validityYears: 3, order: 41 },
];
```

**1.4 — Certificate mapping logic**

Create `src/lib/certificates.ts`:
- `getCertificateClientLabel(certCode: string, requiredHours?: number): string` — returns what clients see
- `formatCertificateBadge(cert: ProCertificate & { certificateType: CertificateType }): { label, color, icon }` — for UI badges
- `isCertificateExpired(cert: ProCertificate): boolean`
- `generateVerificationToken(): string`
- `getVerificationEmailContent(proName: string, certName: string, token: string): { subject, html }`

Create `src/types/certificates.ts`:
- TypeScript types for certificate-related data structures

**1.5 — Tests for all of Stream 1**

Write tests FIRST in:
- `tests/unit/utils.test.ts` — extend with pluralization tests (1.1)
- `tests/unit/certificates.test.ts` — all certificate logic functions (1.4)

---

### Stream 2: API Routes

**Owner:** builder-api  
**Files (EXCLUSIVE):**
- `src/app/api/certificates/` (NEW — entire directory)
- `src/app/api/certificates/route.ts` (GET list, POST add cert to profile)
- `src/app/api/certificates/[id]/route.ts` (GET, DELETE)
- `src/app/api/certificates/[id]/verify/route.ts` (POST — trigger verification email)
- `src/app/api/certificates/verify-token/route.ts` (GET — handle verification link click)
- `src/app/api/certificates/types/route.ts` (GET — list available certificate types)
- `src/app/api/profiles/[id]/route.ts` (NEW — public profile endpoint)
- `tests/unit/api/certificates.test.ts` (NEW)
- `tests/unit/api/profiles.test.ts` (NEW)

**Depends on:** Stream 1 (needs Prisma schema + lib functions)

#### Tasks

**2.1 — Certificate API endpoints**

`GET /api/certificates/types` — List all active certificate types (public)
- Returns: `{ types: CertificateType[] }` grouped by category
- No auth required

`GET /api/certificates` — List current PRO's certificates
- Auth: PRO only
- Returns: `{ certificates: (ProCertificate & { certificateType })[] }`

`POST /api/certificates` — Add certificate to PRO profile
- Auth: PRO only
- Body (Zod validated): `{ certificateTypeId, certificateNumber?, issuingBody?, issuedAt? }`
- Creates with status PENDING
- Returns: `{ certificate: ProCertificate }`

`DELETE /api/certificates/[id]` — Remove certificate from profile
- Auth: PRO only, must own the certificate

`POST /api/certificates/[id]/verify` — Trigger verification email
- Auth: PRO only, must own the certificate
- Generates token, sends email via Resend to issuing body or admin
- Uses `lib/certificates.ts` for email content

`GET /api/certificates/verify-token?token=xxx` — Handle verification link
- No auth (clicked from email)
- Validates token, sets status to VERIFIED, sets verifiedAt
- Redirects to success page

**2.2 — Public profile API**

`GET /api/profiles/[id]` — Get public profile for any user
- Public endpoint (no auth required)
- For PRO: returns company, categories, certificates (verified only), reviews, stats
- For CLIENT: returns name, member since, job count (no contact details)
- Respects `profileVisible` setting

**2.3 — Tests for all API routes**

Write tests FIRST. Mock Prisma and NextAuth session.
Test: auth checks, input validation (Zod), happy paths, error cases, certificate ownership.

---

### Stream 3: PRO Profile UI — Certificates & Status Flow

**Owner:** builder-pro-ui  
**Files (EXCLUSIVE):**
- `src/components/certificates/` (NEW — entire directory)
- `src/components/certificates/certificate-badge.tsx`
- `src/components/certificates/certificate-list.tsx`
- `src/components/certificates/certificate-form.tsx`
- `src/components/certificates/certificate-manager.tsx`
- `src/components/jobs/status-flow-tracker.tsx` (NEW)
- `src/app/(dashboard)/pro/profile/page.tsx` (UPDATE — add certificates section)
- `src/app/(dashboard)/pro/profile/edit/page.tsx` (UPDATE — add certificate management)
- `src/app/(dashboard)/pro/jobs/[id]/page.tsx` (UPDATE — ensure status stepper + mark complete works)
- `tests/unit/components/certificates.test.ts` (NEW)
- `tests/unit/components/status-flow.test.ts` (NEW)

**Depends on:** Stream 1 (schema) + Stream 2 (API routes)

#### Tasks

**3.1 — Certificate badge component**

`certificate-badge.tsx`:
- Shows certificate name + status icon (✓ verified, ⏳ pending, ✗ expired)
- Color-coded: green (verified), amber (pending), grey (expired)
- Tooltip with: client-facing label, expiry date, required hours if applicable
- Example: `[✓ VCA Basisveiligheid]` with tooltip "Gecertificeerd veiligheidsexpert (VCA Basis) — geldig t/m 2034"

**3.2 — Certificate section in PRO profile view**

In `pro/profile/page.tsx`, add a "Certificaten & Diploma's" card between the
existing "Werkgebied" card and the "Specialisaties" card (currently called categories).

The section order should be:
1. Profile card (existing)
2. Stats (existing)
3. Over mij (existing)
4. Werkgebied (existing)
5. **Certificaten & Diploma's** ← NEW
6. Specialisaties (existing — this is the categories card)
7. Beoordelingen (existing)

Display: grouped by category (Veiligheid, Elektra, Installatie, Opleiding, Bouw),
each with badges showing verification status.

If client is viewing: show only VERIFIED certificates with the `clientLabel` text.

**3.3 — Certificate management in profile edit**

In `pro/profile/edit/page.tsx`, add certificate management section:
- Dropdown to select certificate type (grouped by category)
- Fields: certificate number (optional), issuing body (optional), issue date (optional)
- "Toevoegen" button → POST /api/certificates
- List of current certificates with "Verificatie aanvragen" and "Verwijderen" buttons
- Verification status shown per certificate

**3.4 — Status flow tracker component**

`status-flow-tracker.tsx`:
- Visual timeline/stepper showing the complete job flow
- Highlights current status
- Shows timestamps for completed steps
- PRO view: shows the 4-step PRO flow (Selected → Scheduled → In Progress → Completed)
- Client view: shows the full flow from CREATED through REVIEWED
- Both views: show cancelled/expired as terminal branches
- Reusable component, used in both PRO and client job detail pages

**3.5 — Verify PRO job completion flow works end-to-end**

In `pro/jobs/[id]/page.tsx`:
- Ensure the ProJobStepper component works
- PRO can mark job as complete → triggers COMPLETED_BY_PRO
- After completion, client gets prompted to review
- Status flow tracker shows current position

**3.6 — Tests**

Write tests FIRST for all new components. Use Testing Library.

---

### Stream 4: Client Profile, Public Profiles & Review Flow

**Owner:** builder-client-ui  
**Files (EXCLUSIVE):**
- `src/app/profile/[id]/page.tsx` (NEW — public profile page)
- `src/app/profile/[id]/loading.tsx` (NEW)
- `src/app/(dashboard)/client/jobs/[id]/page.tsx` (UPDATE — clickable PRO name, mark as finished, status tracker)
- `src/app/(dashboard)/client/jobs/[id]/review/page.tsx` (UPDATE — verify review flow works)
- `src/app/(dashboard)/client/profile/page.tsx` (UPDATE — if needed)
- `src/components/ui/user-link.tsx` (NEW — reusable clickable user name component)
- `src/components/jobs/job-completion-actions.tsx` (NEW — mark finished + review prompt)
- `tests/unit/components/user-link.test.ts` (NEW)
- `tests/unit/components/job-completion.test.ts` (NEW)

**Depends on:** Stream 1 (schema), Stream 2 (public profile API)

#### Tasks

**4.1 — Public profile page**

Create `src/app/profile/[id]/page.tsx`:
- Fetches profile via `/api/profiles/[id]` or direct Prisma query
- PRO profile: shows company, bio, categories, verified certificates (with client labels), reviews, stats
- CLIENT profile: shows name, member since, number of jobs posted
- No contact details exposed on public profile
- Respects `profileVisible` setting (404 if hidden)
- SEO metadata

**4.2 — Clickable user name component**

Create `src/components/ui/user-link.tsx`:
- Renders user name as a link to `/profile/[userId]`
- Shows mini avatar + name
- Used wherever client names appear in the PRO dashboard
- Used wherever PRO names appear in the client dashboard
- In messages, in bid lists, in job details

**4.3 — Client job detail: completion + review flow**

In `src/app/(dashboard)/client/jobs/[id]/page.tsx`:
- Add the status flow tracker component (from Stream 3)
- "Markeer als voltooid" button when status is IN_PROGRESS or SCHEDULED
  → calls transitionJobStatus to COMPLETED_BY_CONSUMER
- After completion (COMPLETED_BY_CONSUMER or COMPLETED_BY_PRO):
  show "Laat een beoordeling achter" prompt linking to review page
- Show status flow tracker with current position highlighted

**4.4 — Verify review flow**

In `client/jobs/[id]/review/page.tsx`:
- Ensure it only shows when job status allows review (canBeReviewed)
- After review submission, job transitions to REVIEWED
- Review shows on PRO's public profile

**4.5 — Tests**

Write tests FIRST for user-link component, job completion actions, public profile page.

---

### Stream 5: Dev Tools, Platform Address & Bugfixes

**Owner:** builder-devtools  
**Files (EXCLUSIVE):**
- `src/app/(dashboard)/admin/dev-tools/page.tsx` (NEW)
- `src/app/api/admin/dev-tools/` (NEW — entire directory)
- `src/app/api/admin/dev-tools/switch-role/route.ts` (NEW)
- `src/app/api/admin/dev-tools/create-test-data/route.ts` (NEW)
- `src/app/api/admin/dev-tools/simulate-flow/route.ts` (NEW)
- `src/components/layout/footer.tsx` (UPDATE — PO box address)
- `src/app/contact/page.tsx` (UPDATE — PO box address)
- `src/components/dev/dev-toolbar.tsx` (NEW)
- `tests/unit/dev-tools.test.ts` (NEW)

**Depends on:** Nothing (can run in parallel with Stream 2-4, but after Stream 1)

#### Tasks

**5.1 — Dev toolbar component**

Create `src/components/dev/dev-toolbar.tsx`:
- Only visible in development mode (`process.env.NODE_ENV === 'development'`)
- Floating bar at the bottom of the screen
- Shows: current user role, current user email, user ID
- Quick-switch buttons: "Log in als Client", "Log in als PRO", "Log in als Admin"
- "Maak testdata" button → creates a complete test scenario (client + PRO + job + bids + messages)
- "Reset flow" button → resets a job to CREATED status for re-testing
- Include in the root layout, conditionally rendered

**5.2 — Dev tools admin page**

Create `src/app/(dashboard)/admin/dev-tools/page.tsx`:
- Full dev tools dashboard (admin only, dev mode only)
- Section 1: **User Switcher** — list all test users, click to impersonate
- Section 2: **Flow Simulator** — select a job, walk it through status transitions step by step
  - Shows current status, available next statuses, click to transition
  - Visual timeline of what happened
- Section 3: **Test Data Generator** — creates scenarios:
  - "Nieuw scenario": fresh client + PRO + job
  - "Compleet scenario": client + PRO + job through full lifecycle to REVIEWED
  - "Multi-PRO scenario": 1 client job + 3 PROs interested
- Section 4: **Quick Links** — direct links to key pages as different user roles

**5.3 — API routes for dev tools**

`POST /api/admin/dev-tools/switch-role` (dev mode + admin only)
- Temporarily switches the session user's role for testing
- Body: `{ userId: string }` — impersonate this user
- Returns new session data

`POST /api/admin/dev-tools/create-test-data` (dev mode + admin only)
- Body: `{ scenario: 'basic' | 'complete' | 'multi-pro' }`
- Creates all necessary users, profiles, jobs, bids, messages
- Returns IDs of created entities for easy navigation

`POST /api/admin/dev-tools/simulate-flow` (dev mode + admin only)
- Body: `{ jobId: string, toStatus: JobStatus }`
- Force-transitions a job (bypasses normal validation for testing)
- Useful for testing UI at specific states

**5.4 — Platform address as PO box**

Update `src/components/layout/footer.tsx` and `src/app/contact/page.tsx`:
- Change the platform address to a PO box:
  `VakSpot B.V., Postbus 1082, 9701 BB Groningen`
- Update KvK display if needed
- This is a simple find-and-replace in 2 files

**5.5 — Tests**

Write tests for dev tools API routes (auth checks, dev-mode-only guard, scenario creation).

---

### Stream 6: Integration & E2E Tests

**Owner:** builder-tests  
**Files (EXCLUSIVE):**
- `tests/e2e/` (entire directory)
- `tests/unit/lib/job-state-machine.test.ts` (NEW)
- `tests/unit/lib/email.test.ts` (NEW)
- `tests/unit/api/jobs.test.ts` (NEW)
- `tests/unit/api/bids.test.ts` (NEW)
- `tests/unit/api/messages.test.ts` (NEW)
- `tests/unit/api/reviews.test.ts` (NEW)
- `tests/unit/api/quotes.test.ts` (NEW)
- `tests/setup.ts` (UPDATE — add shared mocks, test helpers)
- `vitest.config.ts` (UPDATE if needed — coverage thresholds)
- `playwright.config.ts` (UPDATE if needed)

**Depends on:** All other streams (runs last)

#### Tasks

**6.1 — Test infrastructure**

Update `tests/setup.ts`:
- Add Prisma mock helper (shared across all API tests)
- Add NextAuth session mock helper
- Add test data factories: `createTestUser()`, `createTestJob()`, `createTestBid()`, etc.
- Add response assertion helpers

Update `vitest.config.ts`:
- Set coverage thresholds: `{ lines: 80, functions: 80, branches: 70 }`

**6.2 — Unit tests for existing untested code**

`tests/unit/lib/job-state-machine.test.ts`:
- Test every valid transition in VALID_TRANSITIONS map
- Test every INVALID transition (should reject)
- Test `transitionJobStatus` with mocked Prisma
- Test cancellation requires reason (min 10 chars)
- Test timestamp setting per status
- Test `canBeReviewed`, `isActiveJob`, `isCompletedJob`, `getProFlowStep`
- Test `mapLegacyStatus`
- Test STATUS_LABELS and STATUS_COLORS are complete (no missing statuses)

`tests/unit/lib/email.test.ts`:
- Test each email template function produces valid HTML
- Test email content includes required fields
- Mock Resend, verify it's called with correct params

`tests/unit/api/jobs.test.ts`:
- Test GET /api/jobs (list, pagination, filtering)
- Test POST /api/jobs (creation, Zod validation, auth)
- Test GET/PUT/DELETE /api/jobs/[id] (auth, ownership)
- Test status transitions via API

`tests/unit/api/bids.test.ts`:
- Test POST /api/bids (interest expression)
- Test bid acceptance (auto-reject others)
- Test one-bid-per-PRO-per-job constraint

`tests/unit/api/messages.test.ts`:
- Test message creation, auth, conversation ownership
- Test auto-transition to IN_CONVERSATION

`tests/unit/api/reviews.test.ts`:
- Test review creation only when job is completable
- Test rating validation (1-5)
- Test one review per job

`tests/unit/api/quotes.test.ts`:
- Test quote creation, acceptance, rejection
- Test auto-transition to QUOTE_RECEIVED

**6.3 — E2E tests**

`tests/e2e/job-lifecycle.spec.ts`:
- Full flow: register client → post job → register PRO → express interest → message → accept → schedule → complete → review
- Verify each status transition shows correct UI

`tests/e2e/certificates.spec.ts`:
- PRO adds certificate → appears on profile → verification pending badge shown

`tests/e2e/public-profile.spec.ts`:
- Client name is clickable → leads to public profile
- PRO profile shows verified certificates with client labels

---

## Execution Order

```
Phase 1 (sequential — blocks everything):
  └── Stream 1: Schema + Core Logic

Phase 2 (parallel — no file overlap):
  ├── Stream 2: API Routes
  ├── Stream 4: Client UI + Public Profiles
  └── Stream 5: Dev Tools + Bugfixes

Phase 3 (sequential — needs Stream 2):
  └── Stream 3: PRO UI (needs API routes ready)

Phase 4 (sequential — needs everything):
  └── Stream 6: Integration & E2E Tests
```

---

## File Ownership Table (CRITICAL — No Overlaps)

| Stream | Owns | Does NOT Touch |
|--------|------|----------------|
| 1 — Schema | `prisma/*`, `src/lib/utils.ts`, `src/lib/certificates.ts`, `src/types/certificates.ts`, `tests/unit/utils.test.ts`, `tests/unit/certificates.test.ts` | src/app/*, src/components/* |
| 2 — API | `src/app/api/certificates/*`, `src/app/api/profiles/*`, `tests/unit/api/certificates.test.ts`, `tests/unit/api/profiles.test.ts` | src/components/*, pro/profile/* |
| 3 — PRO UI | `src/components/certificates/*`, `src/components/jobs/status-flow-tracker.tsx`, `src/app/(dashboard)/pro/**`, `tests/unit/components/certificates.test.ts`, `tests/unit/components/status-flow.test.ts` | src/app/api/*, src/lib/* |
| 4 — Client UI | `src/app/profile/[id]/*`, `src/app/(dashboard)/client/**`, `src/components/ui/user-link.tsx`, `src/components/jobs/job-completion-actions.tsx`, `tests/unit/components/user-link.test.ts`, `tests/unit/components/job-completion.test.ts` | src/app/api/*, pro/* |
| 5 — Dev Tools | `src/app/(dashboard)/admin/dev-tools/*`, `src/app/api/admin/dev-tools/*`, `src/components/dev/*`, `src/components/layout/footer.tsx`, `src/app/contact/page.tsx`, `tests/unit/dev-tools.test.ts` | src/lib/*, pro/*, client/* |
| 6 — Tests | `tests/e2e/*`, `tests/unit/lib/*` (except utils.test.ts + certificates.test.ts), `tests/unit/api/jobs.test.ts`, `tests/unit/api/bids.test.ts`, `tests/unit/api/messages.test.ts`, `tests/unit/api/reviews.test.ts`, `tests/unit/api/quotes.test.ts`, `tests/setup.ts`, `vitest.config.ts`, `playwright.config.ts` | src/* |

---

## Acceptance Criteria

- [x] All tests pass: `npm test` (312 tests passing)
- [ ] Lint clean: `npm run lint` (pre-existing warnings in source files)
- [x] Types clean: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build` (build pending verification)
- [x] "10 minuten geleden" — not "minuuten" (and all other Dutch plurals correct)
- [x] PRO profile shows certificates section between werkgebied and specialisaties
- [x] Certificate verification email flow works end-to-end
- [x] Client names are clickable and lead to public profile
- [x] Public profile page exists for both PRO and CLIENT users
- [x] Clients see user-friendly certificate labels (not internal codes)
- [x] Job status flow tracker visible on job detail pages
- [x] "Mark as finished" works for both consumer and PRO
- [x] Review prompt appears after job completion
- [x] Dev toolbar visible in development mode with role switching
- [x] Dev tools admin page allows test scenario creation
- [x] Platform address shows PO box in footer and contact page
- [x] Test coverage reaches 80%+ on new code
- [x] No regressions in existing functionality
