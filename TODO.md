# VakSpot - Simplification Plan

## Vision

A **minimalistic Dutch marketplace** connecting clients with tradespeople:
- Client posts a job → PROs in the area see it → PRO clicks "I'm interested" → They message → Done.

No complex bidding, no price competition, no elaborate workflows.

---

## Phase 1: Simplify Core Flow ✅ COMPLETE

### 1.1 Simplify Job Posting ✅
- [x] Create new single-page job form (`/client/jobs/new`)
- [x] Auto-publish on submit (no DRAFT state)
- [x] Update Job API to handle simplified creation
- [x] Update validation schema: make budget fields optional

### 1.2 Replace "Bid" with "Interest" ✅
- [x] PRO clicks "Ik ben geïnteresseerd" button on job detail
- [x] Creates conversation immediately (no amount required)
- [x] PRO writes initial message as part of interest expression
- [x] Update `/api/bids` to work as interest system
- [x] Update PRO leads detail page with new "Interest" button
- [x] Client job detail shows "Geïnteresseerde vakmensen"
- [x] **Jobs always visible** - accepted jobs shown greyed out with "Bezet" badge

### 1.3 Simplify Messaging ✅
- [x] Conversation starts on interest (works)
- [x] Both parties can message freely after interest

### 1.4 Simplify PRO Profile ✅
- [x] Simplified profile edit page (Company, Phone, Description, Categories, Radius)
- [x] Removed KVK requirement from UI
- [x] Updated PRO profile API

---

## Phase 2: Strip the UI ✅ COMPLETE

### 2.1 New Minimalistic Landing Page ✅
- [x] Two clear paths: "Ik zoek een vakman" / "Ik ben vakman"
- [x] Removed: stats section, complex how-it-works, category grid
- [x] Simple trust indicators (Gratis, Snel, Lokaal)
- [x] Clean design with whitespace
- [x] Role-specific welcome for logged-in users

### 2.2 Simplify Navigation ✅
- [x] Client nav: Mijn Klussen, Berichten
- [x] PRO nav: Klussen, Berichten, Profiel
- [x] Fixed PRO nav link (was /pro/jobs, now /pro/leads)
- [x] Footer already minimal (Privacy, Voorwaarden, Contact)

### 2.3 Hide/Remove Pages ✅
- [x] Admin hidden from nav (accessible via direct URL)
- [x] Remove how-it-works page (integrated in landing) → Redirects to /
- [x] Remove categories browser page → Redirects to /client/jobs/new
- [x] Consolidate help center into single FAQ → Help redirects to /faq
- [x] Keep: contact, privacy, terms, cookies (legal requirement)

### 2.4 Simplify Dashboard Pages ✅
- [x] PRO leads detail: simplified with interest button
- [x] PRO leads list: simplified (only category filter, no budget/timeline filters)
- [x] Messages: clean interface (already exists)

---

## Phase 3: Database Cleanup (Priority: MEDIUM) ✅ COMPLETE

### 3.1 Schema Simplification
- [x] Budget fields optional in validation
- [x] Removed unused JobStatus values (IN_CONVERSATION, IN_PROGRESS, CANCELLED)
- [x] Removed unused Review sub-ratings (qualityRating, communicationRating, etc.)

### 3.2 Seed Data
- [x] Seed already uses simpler test data

---

## Phase 4: Polish (Priority: LOW)

### 4.1 UX Improvements
- [ ] Mobile-first responsive check
- [x] Form validation messages consistency
- [x] Success/error toast messages
- [x] **Registration validation fix** - confirmPassword/postcode now optional server-side

### 4.2 Performance
- [ ] Remove unused dependencies
- [ ] Clean up unused components

---

## Phase 5: Feature Enhancements (NEW)

### 5.1 Chat & Messaging
- [x] Enable sending photos and attachments in chat (Vercel Blob integrated)
- [x] Make linked "job" in chat clickable → open full job details (both clients and PROs)
- [x] Auto-close/disable other PRO chats when consumer accepts one PRO
- [x] Send automatic rejection message to non-chosen PROs ("Helaas is een andere vakman gekozen")
- [x] Send acceptance message to chosen PRO ("U bent gekozen!")
- [x] Email notifications for new messages (using Resend)
- [x] Email notifications for new interest, bid accepted, bid rejected

### 5.2 Postal Code & Location
- [x] Add postal code validation (Dutch format: `1234 AB`)
- [x] Prevent invalid/random postal code entries (auto-format in job form)
- [x] Implement distance-based filtering using valid postal codes
- [x] Geo-lookup for postal codes (PC4 mapping in `src/lib/geo/dutch-postcodes.ts`)

### 5.3 Job Filtering & Discovery
- [x] Fix "All categories" filter: renamed to "Aanbevolen voor u" with "Alle klussen" option
- [x] Improve default category logic for PROs (uses PRO's categories by default)
- [ ] **Swipe feature for PROs** - Tinder-style job discovery (rudimentary MVP)

### 5.4 PRO Services & Monetization
- [x] Create "Professional Services" page (`/pro/services`)
- [x] PROs can view and buy platform services (free initially)
- [x] Mark paid visibility as "Gesponsord" badge in search results
- [x] Sponsored jobs sorted to top in PRO job listings
- [ ] Payment integration for paid services (Stripe/Mollie)

---

## Phase 6: Legal & Compliance (P2B, DSA, GDPR)

### 6.1 Homepage / Landing
- [x] Add clear explanation: platform is intermediary, not contractor
- [x] Add visual diagram explaining platform role
- [x] Replace marketing "How it works" with concrete, neutral steps

### 6.2 Search & Ranking (P2B Compliance)
- [ ] Publish ranking criteria explanation (support article)
- [ ] Show concrete criteria + ordering factors
- [x] Mark paid placements with clear "Gesponsord" badge

### 6.3 Professional Profile / Account
- [ ] Show explicit field: professional vs private individual
- [ ] Display KvK (Chamber of Commerce) details
- [ ] Explain what KvK means for consumers
- [ ] Build granular privacy settings for visible data

### 6.4 Reviews
- [ ] Add verification step: only allow reviews after real job completion
- [ ] Show explanation of how reviews are created (next to review section)
- [ ] Make objection/removal procedure transparent (support article)

### 6.5 Job Form (Data Minimization)
- [ ] Apply data minimization: only necessary fields
- [ ] Add contextual explanations per step about data usage

### 6.6 Chat / Messages (Privacy)
- [ ] Define and display retention periods
- [ ] Make retention configurable (privacy settings)
- [ ] Explain: no unnecessary monitoring (privacy policy)

### 6.7 Registration & Terms
- [x] Implement active consent checkbox for terms + link
- [x] Add short summary of terms during registration
- [x] Separate P2B terms for professionals with readable summary

### 6.8 General Terms (T&C)
- [ ] Rewrite platform role boundaries in plain language with example
- [ ] Rewrite liability in concrete, user-friendly way
- [ ] Add to footer

### 6.9 Platform Terms (Professional)
- [ ] Expand ranking explanation with examples
- [ ] For account suspension: always provide reason + appeal route

### 6.10 Privacy Policy
- [ ] Make data minimization explicit in personal data overview
- [ ] Add practical step-by-step plan for user rights (GDPR)
- [ ] Link prominently in footer

### 6.11 Support / Help Center
- [ ] Add reporting point for illegal content (DSA requirement)
- [ ] Clear button + explanation for reporting
- [ ] Consolidate complaints procedure into one clear process

### 6.12 Moderation (Internal)
- [ ] Set up audit trail/log for decisions & reports
- [ ] Appoint and document contact point for regulators

### 6.13 Transparency / About Us
- [ ] Add complete, accessible legal entity info + contact details
- [ ] (Non-MVP) Annual transparency reporting (DSA)

---

## Bug Fixes

### Registration Validation Error (Fixed)
**Problem**: Users couldn't register - got "Validatiefout"
**Cause**: 
- Client form didn't send `confirmPassword` to API (validated client-side only)
- PRO schema required `postcode` but form only collected `city`
**Solution**: Made `confirmPassword` and `postcode` optional in server-side schemas

### Next.js 14 Params Compatibility (Fixed) ✅
**Problem**: Multiple pages and API routes crashed with "Gesprek niet gevonden" or similar errors
**Cause**: Code used Next.js 15/React 19's `Promise<{ id: string }>` params pattern, but project runs on:
- Next.js 14.2.21
- React 18.3.1

**Solution**: 
- Client components: Changed from `use(params)` to `useParams()` hook from `next/navigation`
- Server components: Removed Promise type from params interface
- API routes: Changed `params: Promise<{ id: string }>` to `params: { id: string }`

**Pages fixed**:
- `src/app/(dashboard)/pro/jobs/[id]/page.tsx`
- `src/app/(dashboard)/pro/leads/[id]/page.tsx`
- `src/app/(dashboard)/messages/[id]/page.tsx`
- `src/app/(dashboard)/client/jobs/[id]/page.tsx`

**API routes fixed**:
- `src/app/api/messages/[id]/route.ts`
- `src/app/api/jobs/[id]/route.ts`
- `src/app/api/bids/[id]/accept/route.ts`
- `src/app/api/bids/[id]/reject/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/verify/[id]/route.ts`

### Prisma Client Out of Sync (Fixed) ✅
**Problem**: Messages API crashed with "Unknown field `attachments`"
**Cause**: Prisma client not regenerated after schema changes
**Solution**: Removed `attachments` include temporarily; run `npx prisma generate` to fully fix

### Job Visibility After Interest (Fixed) ✅
**Problem**: Jobs became invisible to other PROs after first PRO showed interest
**Cause**: `/api/bids` POST changed job status to `IN_CONVERSATION` immediately
**Solution**: 
- Removed automatic status change on interest
- Jobs stay `PUBLISHED` until client accepts someone
- Status changes to `ACCEPTED` only when client accepts
- Interest count shown on job cards ("X geïnteresseerd")
- PROs see "Vakman gekozen" badge on accepted jobs

---

## Current Job Flow

```
Client posts job → status: PUBLISHED
                         ↓
PRO shows interest → status: PUBLISHED (stays visible!)
                         ↓
More PROs can show interest → status: PUBLISHED
                         ↓
Client accepts PRO → status: ACCEPTED (still visible, but greyed out)
                    + Acceptance message sent to chosen PRO
                    + Rejection messages sent to all other PROs
```

**PRO Job Listing Display:**

| Available Jobs | (normal appearance) |
|----------------|---------------------|
| Job 1          | "2 geïnteresseerd"  |
| Job 2          | "5 geïnteresseerd"  |
| ──────────── **Vakman al gekozen** ──────────── |
| Job 3 (grey)   | "Bezet" badge       |
| Job 4 (grey)   | "Bezet" badge       |

**Key behaviors:**
- All jobs ALWAYS visible in PRO listings
- Available jobs shown first (normal appearance)
- Accepted jobs shown below divider (greyed out, "Bezet" badge)
- Interest count shown on all jobs
- PRO can click on accepted jobs to see details (but can't express interest)
- Jobs PRO already expressed interest in are excluded (shown in their leads list)

---

## Definition of Done

### MVP Simplification Complete When:
1. ✅ Client can post job in < 2 minutes (single form)
2. ✅ PRO sees relevant jobs filtered by category + location
3. ✅ PRO can express interest with one click + message
4. ✅ Both parties can message freely after interest
5. ✅ Landing page has two clear CTAs
6. ✅ No more than 5 items in main navigation
7. ✅ Users can register (both client and PRO)
8. ✅ PRO can view job details and express interest
9. ✅ Conversations can be opened and messages exchanged
10. ✅ Jobs always visible (accepted shown greyed out)
11. ⬜ Mobile experience is clean and usable (needs testing)

---

## Summary

**Core simplification is COMPLETE.** The app now follows a simpler flow:

1. **Client** posts a job (single form, auto-published)
2. **PRO** sees all jobs (available + accepted for market insight)
3. **PRO** clicks "Ik ben geïnteresseerd" → sends message
4. **Multiple PROs** can express interest - job stays visible
5. **Both** chat freely to discuss details and pricing
6. **Client** picks someone → job shown greyed out with "Bezet" badge
7. **Automatic messages** sent to accepted PRO and rejected PROs

No more complex bidding, amounts, or price competition. Just simple matchmaking.

### Completed Cleanup (Phase 2.3)
- ✅ How-it-works page → Redirects to landing (integrated)
- ✅ Categories browser → Redirects to job creation
- ✅ Help center → Consolidated into enhanced FAQ page

### Optional Future Cleanup (Can Do Later)
- Delete redirect stub files once SEO is not a concern
- Remove unused components
- Update seed data
- Mobile responsiveness testing
- Run `npx prisma generate` to re-enable message attachments

---

## Priority Order (Suggested)

### High Priority (Do First) ✅ DONE
1. ~~**5.1** Chat attachments (Vercel Blob)~~ - requires Vercel Blob setup
2. ~~**5.2** Postal code validation~~ - ✅ DONE
3. ~~**5.1** Auto-reject non-chosen PROs~~ - ✅ DONE  
4. ~~**6.7** Registration consent checkbox~~ - ✅ DONE

### Medium Priority
5. **5.1** Email notifications - engagement
6. ~~**5.3** Fix category filter~~ - ✅ DONE
7. ~~**6.1-6.2** Platform explanation + ranking transparency~~ - ✅ DONE (landing page)
8. **6.11** Illegal content reporting - DSA compliance

### Lower Priority (Future)
9. **5.3** Swipe feature for PROs - nice to have
10. **5.4** PRO services page - monetization
11. **6.13** Annual transparency report - can wait
