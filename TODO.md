# VakSpot — Master Plan

## Vision

A **minimalistic Dutch marketplace** connecting clients with tradespeople:
- Client posts a job → PROs in the area see it → PRO clicks "I'm interested" → They message → Done.

---

## Phase 1-3: Core Simplification ✅ COMPLETE

All core simplification work is done:
- Single-page job form with auto-publish
- "Interest" system replacing complex bidding
- Simplified messaging
- Minimalistic UI with clean navigation
- Database schema simplified

---

## Phase 4: Polish

### 4.1 UX Improvements
- [ ] Mobile-first responsive check
- [x] Form validation messages consistency
- [x] Success/error toast messages
- [x] Registration validation fix

### 4.2 Performance
- [x] Remove unused dependencies (removed date-fns)
- [x] Clean up unused components

---

## Phase 5: Feature Enhancements

### 5.1 Chat & Messaging ✅ COMPLETE
- [x] Photos and attachments in chat (Vercel Blob)
- [x] Clickable job link in chat → opens full job details
- [x] Auto-close/reject other PROs when one is accepted
- [x] Automatic acceptance/rejection messages
- [x] Email notifications (Resend) for messages, interest, acceptance, rejection

### 5.2 Postal Code & Location ✅ COMPLETE
- [x] Dutch postal code validation (`1234 AB`)
- [x] Auto-format in job form
- [x] Distance-based filtering
- [x] Geo-lookup (PC4 mapping)

### 5.3 Job Filtering & Discovery ✅ COMPLETE
- [x] "Aanbevolen voor u" + "Alle klussen" filter
- [x] Default to PRO's categories
- [x] Swipe feature for PROs (Tinder-style) - `/pro/swipe`
- [x] Distance filter on jobs page (5/10/25/50/100 km)

### 5.4 PRO Services & Monetization ✅ MOSTLY COMPLETE
- [x] Professional Services page (`/pro/services`)
- [x] View and purchase platform services
- [x] "Gesponsord" badge on sponsored jobs
- [x] Sponsored jobs sorted to top
- [ ] Payment integration (Stripe/Mollie)

### 5.5 Job Management ✅ COMPLETE
- [x] Delete job button (`delete-job-button.tsx` + `DELETE /api/jobs/[id]`)

---

## Phase 6: Legal & Compliance (P2B, DSA, GDPR)

### 6.1 Homepage / Landing ✅ COMPLETE
- [x] Platform role explanation on landing page (intermediary, not contractor)
- [x] Visual diagram
- [x] Concrete "How it works" steps
- [x] Platform role explanation also in footer (added in expanded footer)

### 6.2 Search & Ranking ✅ COMPLETE
- [x] "Gesponsord" badge on paid placements (`pro/jobs/page.tsx`)
- [x] "Gesponsord" tooltip explanation (`pro/jobs/page.tsx`)
- [x] Ranking criteria explanation page `/ranking` (P2B requirement)

### 6.3 Professional Profile / Account ✅ COMPLETE
- [x] `kvkNumber` field in Prisma schema (on ProProfile)
- [x] KvK number displayed on PRO profile page (was already wired)
- [x] KvK number editable in PRO profile edit page (was already wired)
- [x] KvK explanation for consumers in FAQ (added to Veiligheid section)
- [x] Privacy settings page (`/settings/privacy`) — has marketing toggle, profile visibility, GDPR export, account deletion
- [x] "Professional vs private individual" explicit field (added `entityType` enum: BUSINESS/INDIVIDUAL)

### 6.4 Reviews ✅ MOSTLY COMPLETE
- [x] Backend verification (checks job COMPLETED/ACCEPTED)
- [ ] User confirmation step before review (explicit "work done" button — relates to Phase 7 completion flow)
- [x] Review explanation in FAQ
- [x] Review objection/removal procedure in FAQ

### 6.5 Job Form ✅ COMPLETE
- [x] Data minimization (minimal required fields)
- [x] Contextual explanations per field about data usage

### 6.6 Chat / Messages (Privacy) ✅ MOSTLY COMPLETE
- [x] Retention mentioned in privacy policy ("max 2 jaar")
- [x] Specific chat message retention period defined (section 7a added with detailed timelines)
- [ ] User-configurable retention in privacy settings (P3 - nice to have)
- [x] "No unnecessary monitoring" statement in privacy policy (section 7a added)

### 6.7 Registration & Terms ✅ COMPLETE
- [x] Active consent checkbox with links
- [x] Short summary of terms during registration
- [x] `#professionals` section in terms page (Section 6a)

### 6.8 General Terms (T&C) ✅ COMPLETE
- [x] Platform role explained (Section 3) with concrete example scenario
- [x] Concrete example scenario for platform role added (schilder example)
- [x] Liability section exists (Section 8)
- [x] Liability rewritten in plain language with examples

### 6.9 Platform Terms (Professional) ✅ COMPLETE
- [x] Detailed ranking explanation with examples (`/ranking` page)
- [x] Account suspension feature with mandatory reason (Prisma + API)
- [x] Appeal/objection route (`/appeal` page + `/api/appeals/`)

### 6.10 Privacy Policy ✅ COMPLETE
- [x] User rights listed
- [x] Data minimization principle explicit
- [x] Step-by-step GDPR rights procedure

### 6.11 Support / Help Center (DSA) ✅ COMPLETE
- [x] ReportButton component exists (`report-button.tsx`) with full modal UI
- [x] Reports API exists (`/api/reports`) with target validation, dedup, CRUD
- [x] Admin reports management page (`/admin/reports`) with filters, stats, resolution workflow
- [x] ReportButton placed in: PRO job detail, messages, client job detail (for reporting PROs)
- [x] "Target not found" error fixed (was already working, component receives correct props)
- [x] Complaints procedure page (`/complaints`)

### 6.12 Moderation (Internal) ✅ COMPLETE
- [x] ModerationLog Prisma model with audit trail
- [x] Admin reports interface with resolution workflow
- [x] Document contact point for regulators (added to contact page)

### 6.13 Transparency / About Us ✅ MOSTLY COMPLETE
- [x] Contact page exists with email/phone/city
- [x] Complete legal entity info (KvK number, full legal name, complete address) on contact page (was already present)
- [ ] (Non-MVP) Annual transparency reporting page

### 6.14 Footer ✅ COMPLETE
Footer expanded with 4 columns: Brand/Role, Quick Links, Legal, Company Info
- [x] Add platform role statement (intermediary, not contractor)
- [x] Add link to `/ranking` (ranking criteria)
- [x] Add link to `/complaints` (complaints procedure)
- [x] Add link to `/faq` and `/help`
- [x] Add KvK number and legal entity name

---

## Phase 7: Job Status Lifecycle (Status Blueprint)

### Context
Current system has 5 statuses: `DRAFT`, `PUBLISHED`, `ACCEPTED`, `COMPLETED`, `REVIEWED`.
Blueprint requires 15 statuses for tracking, conversion reporting, automated emails, and retargeting.

### 7.1 Schema: Expand JobStatus Enum (5 → 15)

| # | New Status | Current Equivalent | Action |
|---|-----------|-------------------|--------|
| 1 | CREATED | DRAFT | Rename |
| 2 | FLAGGED | — | New |
| 3 | RESPONSES_RECEIVED | — | New: auto when ≥1 PRO interest |
| 4 | IN_CONVERSATION | — | New: auto when ≥1 message exchange |
| 5 | QUOTE_RECEIVED | — | New: needs quote feature |
| 6 | SELECTED | ACCEPTED | Rename ("Nader te bepalen") |
| 7 | SCHEDULED | — | New: PRO sets start date |
| 8 | IN_PROGRESS | — | New: work started |
| 9 | COMPLETED_BY_CONSUMER | COMPLETED | Split by actor |
| 10 | COMPLETED_BY_PRO | — | New |
| 11 | REVIEWED | REVIEWED | Exists |
| 12 | CANCELLED_BY_CONSUMER | — | New |
| 13 | CANCELLED_BY_PRO | — | New (reason required) |
| 14 | NO_MATCH | — | New: no responses after timeout |
| 15 | EXPIRED | — | New: job inactive |

Tasks:
- [x] Update Prisma `JobStatus` enum (5 → 15 values)
- [ ] Write data migration (DRAFT→CREATED, ACCEPTED→SELECTED, COMPLETED→COMPLETED_BY_CONSUMER)
- [ ] Update all API routes referencing old status values
- [x] Update all UI components displaying/filtering by status (JOB_STATUS_CONFIG updated)

### 7.2 Schema: New Fields on Job Model ✅ COMPLETE

Currently has `startDate` and `completedAt`. Added:
- [x] `startedAt` (DateTime, nullable) — actual work start timestamp
- [x] `completedAtByPro` (DateTime, nullable)
- [x] `completedAtByCons` (DateTime, nullable)
- [x] `cancelledAt` (DateTime, nullable)
- [x] `cancellationReason` (String, nullable, min 10 chars)
- [x] `statusChangedBy` (enum: CONSUMER | PROFESSIONAL | SYSTEM | ADMIN)
- [x] `statusChangedAt` (DateTime)

### 7.3 Schema: StatusHistory Model (Audit Trail) ✅ COMPLETE

- [x] Create `StatusHistory` model: jobId, fromStatus, toStatus, changedBy, changedAt, reason
- [x] Log every status transition automatically (via transitionJobStatus)

### 7.4 State Machine: Transition Validation

```
1 CREATED → 3 RESPONSES_RECEIVED (auto: first PRO interest)
1 CREATED → 2 FLAGGED (via report system)
1 CREATED → 14 NO_MATCH (timeout)
1 CREATED → 15 EXPIRED (inactive)
3 → 4 IN_CONVERSATION (auto: first message)
4 → 5 QUOTE_RECEIVED (PRO sends quote)
4/5 → 6 SELECTED (consumer accepts PRO)
6 → 7 SCHEDULED (PRO sets future start_date)
7 → 8 IN_PROGRESS (auto on start_date or manual)
7 → 9/10 COMPLETED (direct if trivial)
8 → 9/10 COMPLETED
9/10 → 11 REVIEWED (consumer leaves review)
6/7/8 → 12 CANCELLED_BY_CONSUMER
6/7/8 → 13 CANCELLED_BY_PRO (reason required, min 10 chars)
```

Tasks:
- [x] Implement state machine validation lib (reject invalid transitions) — `lib/job-state-machine.ts`
- [ ] Auto-transition: CREATED→RESPONSES_RECEIVED on first bid/interest
- [ ] Auto-transition: RESPONSES_RECEIVED→IN_CONVERSATION on first message
- [ ] Auto-transition: SCHEDULED→IN_PROGRESS when `start_date` reached (cron or on-access)
- [ ] Auto-transition: CREATED→NO_MATCH / EXPIRED after configurable timeout
- [ ] Skip PUBLISHED: auto-publish on create (CREATED = published)

### 7.5 PRO 4-Step Flow UI ✅ COMPLETE

After selection (status 6), PRO sees: `Selected → Scheduled → In Progress → Completed`

- [x] Progress bar / stepper component on PRO job detail view — `ProJobStepper`
- [x] Step 1 — Selected: "Nader te bepalen" badge + "Startdatum instellen" action
- [x] Step 2 — Scheduled: Date picker (future date required), confirm button → status 7
- [x] Step 3 — In Progress: Manual "Start werk" button → status 8
- [x] Step 4 — Completed: "Markeer als voltooid" button → status 10 (COMPLETED_BY_PRO)
- [x] Cancel button at steps 1-3 (reason required, min 10 chars) → status 13
- [x] PROs do NOT see/interact with statuses 1-5, 9, 12, 14, 15

### 7.6 Consumer Actions UI ✅ COMPLETE

- [x] "Markeer als voltooid" button at statuses 7/8 → status 9 (COMPLETED_BY_CONSUMER)
- [x] "Annuleer project" button at statuses 6/7/8 → status 12 (CANCELLED_BY_CONSUMER)
- [x] After completion (9/10): prompt for review → status 11
- [ ] Flag conversation option → status 2 (FLAGGED)

### 7.7 Quote Feature (Status 5)

- [ ] Quote data model (amount, description, validUntil, status)
- [ ] PRO quote sending UI (amount, description, validity period)
- [ ] Consumer accept/decline quote UI
- [ ] Auto-transition IN_CONVERSATION→QUOTE_RECEIVED when quote sent

### 7.8 Automated Emails for Status Changes

- [ ] Status 6 (Selected): email PRO to set start date
- [ ] Status 7 (Scheduled): confirm date to both parties
- [ ] Status 8 (In Progress): reminder that work is starting
- [ ] Status 9/10 (Completed): prompt consumer for review
- [ ] Status 12/13 (Cancelled): notify other party
- [ ] Nudge: PRO hasn't set start date within X days of selection
- [ ] Nudge: job has no responses after X days

### 7.9 Reporting & Analytics Dashboard

- [ ] Status distribution chart (admin dashboard)
- [ ] Conversion funnel: Created → Responses → Selected → Completed → Reviewed
- [ ] Identify conversion killers (where jobs stall)
- [ ] Monthly reporting data export
- [ ] Average time between transitions

---

## Bug Tracker

### 🐛 Open Bugs
| # | Bug | Severity | Location | Notes |
|---|-----|----------|----------|-------|
| — | All P0 bugs resolved | — | — | — |

### ✅ Resolved Bugs
- ✅ B1: ReportButton placed in PRO job detail, messages, and client job detail pages
- ✅ B2: "Target not found" was already working (component receives correct props)
- ✅ B3: KvK displayed on PRO profile (was already implemented)
- ✅ B4: KvK editable in PRO profile edit (was already implemented)
- ✅ B5: Footer expanded with all links, legal info, KvK number
- ✅ B6: Platform role statement added to footer
- ✅ B7: Added `entityType` field (BUSINESS/INDIVIDUAL) to PRO profile
- ✅ Registration validation error — fixed
- ✅ Next.js 14 params compatibility — fixed
- ✅ Prisma client sync — fixed
- ✅ Job visibility after interest — fixed
- ✅ Login redirect stuck — fixed (removed per-request DB query in JWT callback)
- ✅ Logout not working — fixed (using next-auth/react signOut)

---

## Verified Complete Items

Everything below has been code-verified as actually implemented:

| Feature | Files Verified |
|---------|---------------|
| Distance-based filtering | `api/leads/route.ts` |
| Email notifications | `lib/email.ts` + API routes |
| Swiping feature for PROs | `pro/swipe/` directory |
| Clickable job in chat | `messages/[id]/page.tsx` |
| Photos/attachments in chat | Vercel Blob integration |
| Postal code validation | `job-form.tsx` |
| Auto-close/reject other PROs | `api/bids/[id]/accept/route.ts` |
| "Aanbevolen" + "Alle klussen" | `pro/jobs/page.tsx` |
| Professional Services page | `pro/services/page.tsx` |
| "Gesponsord" badge + sorting | `pro/jobs/page.tsx` + `api/leads/route.ts` |
| Platform role on landing | `page.tsx` |
| Visual diagram on landing | `page.tsx` |
| Concrete "How it works" | `page.tsx` |
| Data minimization in form | `job-form.tsx` |
| Active consent checkbox | `register/client` + `register/pro` |
| Terms summary during registration | `register/client` + `register/pro` |
| Backend review verification | `api/reviews/route.ts` |
| Delete job button | `delete-job-button.tsx` + `api/jobs/[id]` |
| ReportButton component | `components/ui/report-button.tsx` ✅ now placed in pages |
| Reports API + admin page | `api/reports/` + `admin/reports/page.tsx` |
| Account suspension | `api/admin/users/[id]/suspend/` + `suspended/page.tsx` |
| Appeal system | `appeal/page.tsx` + `api/appeals/` |
| Ranking criteria page | `ranking/page.tsx` |
| Privacy settings page | `settings/privacy/page.tsx` |
| Complaints page | `complaints/page.tsx` |
| P2B terms section | `terms/page.tsx` section 6a with id="professionals" |
| ModerationLog model | `prisma/schema.prisma` |
| Contact page | `contact/page.tsx` |
| Swipe feature | `pro/swipe/` directory |
| Footer expanded | `components/layout/footer.tsx` - 4 columns with all legal info |
| Platform role example in T&C | `terms/page.tsx` Section 3 with schilder example |
| Liability in plain language | `terms/page.tsx` Section 8 rewritten |
| KvK explanation for consumers | `faq/page.tsx` Veiligheid section |
| Entity type (Business/Individual) | `prisma/schema.prisma` + profile pages |
| Chat retention policy | `privacy/page.tsx` Section 7a with specific periods |
| No monitoring statement | `privacy/page.tsx` Section 7a |
| ReportButton on client jobs | `client/jobs/[id]/page.tsx` for reporting PROs |

---

## Priority Roadmap

### ✅ P0 — Fix Bugs (Blocks DSA/P2B compliance) — COMPLETE
1. ~~**B1+B2**: Wire up ReportButton to job detail, profile, and message pages~~ ✅
2. ~~**B3+B4**: Display and edit KvK number on PRO profile pages~~ ✅ (was already working)
3. ~~**B5+B6**: Expand footer with legal info, links, platform role~~ ✅

### 🔴 P1 — Phase 7 Foundation (Status Blueprint)
4. Schema changes: JobStatus enum expansion + new fields + StatusHistory model (7.1-7.3)
5. State machine validation lib (7.4)
6. PRO 4-step flow UI (7.5)
7. Consumer completion + cancellation UI (7.6)

### 🟡 P2 — Phase 7 Features
8. Auto-transitions: interest → conversation → scheduled → in progress (7.4)
9. Quote feature (7.7)
10. Automated status change emails (7.8)
11. ~~T&C improvements: platform role example + liability plain language (6.8)~~ ✅
12. "Work done" confirmation before review (6.4 → ties into 7.6 completion flow)

### 🟢 P3 — Nice to Have
13. Reporting & analytics dashboard (7.9)
14. Chat retention configurability (6.6)
15. ~~"No monitoring" statement in privacy policy (6.6)~~ ✅
16. ~~"Professional vs individual" explicit toggle (B7)~~ ✅
17. Payment integration (Stripe/Mollie)

### ⚪ P4 — Non-MVP
18. Annual transparency reporting
19. Regulator contact documentation

---

## Quick Stats

| Category | Count |
|----------|-------|
| ✅ Verified complete | 40+ |
| 🐛 Open bugs | 0 |
| ❌ Phase 6 remaining | ~3 tasks |
| ❌ Phase 7 (new) | ~46 tasks |
| **Total tracked** | **~93** |

---

## Current Job Flow (will be replaced by Phase 7)

```
Client posts job → status: PUBLISHED
        ↓
PRO shows interest → status: PUBLISHED (stays visible)
        ↓
More PROs can show interest → status: PUBLISHED
        ↓
Client accepts PRO → status: ACCEPTED
        + Acceptance message to chosen PRO
        + Rejection messages to other PROs
        + Email notifications sent
```

### Target Flow (Phase 7)

```
Client posts job → 1 CREATED
        ↓ (auto)
PRO shows interest → 3 RESPONSES_RECEIVED
        ↓ (auto)
Messages exchanged → 4 IN_CONVERSATION
        ↓ (optional)
PRO sends quote → 5 QUOTE_RECEIVED
        ↓
Client accepts PRO → 6 SELECTED ("Nader te bepalen")
        ↓
PRO sets start date → 7 SCHEDULED
        ↓ (auto on date)
Work begins → 8 IN_PROGRESS
        ↓
Consumer/PRO marks done → 9/10 COMPLETED
        ↓
Consumer leaves review → 11 REVIEWED

Cancellation: 6/7/8 → 12 (by consumer) or 13 (by PRO + reason)
No response: 1 → 14 NO_MATCH
Inactive: 1 → 15 EXPIRED
```
