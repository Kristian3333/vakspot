# VakSpot - Simplification Plan

## Vision

A **minimalistic Dutch marketplace** connecting clients with tradespeople:
- Client posts a job → PROs in the area see it → PRO clicks "I'm interested" → They message → Done.

No complex bidding, no price competition, no elaborate workflows.

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
- [ ] Remove unused dependencies
- [ ] Clean up unused components

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

### 5.3 Job Filtering & Discovery ✅ MOSTLY COMPLETE
- [x] "Aanbevolen voor u" + "Alle klussen" filter
- [x] Default to PRO's categories
- [ ] Swipe feature for PROs (Tinder-style) - not started

### 5.4 PRO Services & Monetization ✅ MOSTLY COMPLETE
- [x] Professional Services page (`/pro/services`)
- [x] View and purchase platform services
- [x] "Gesponsord" badge on sponsored jobs
- [x] Sponsored jobs sorted to top
- [ ] Payment integration (Stripe/Mollie) - not started

---

## Phase 6: Legal & Compliance (P2B, DSA, GDPR)

### 6.1 Homepage / Landing ✅ COMPLETE
- [x] Platform role explanation (intermediary, not contractor)
- [x] Visual diagram
- [x] Concrete "How it works" steps

### 6.2 Search & Ranking ✅ COMPLETE
- [x] "Gesponsord" badge on paid placements
- [x] Add tooltip/explanation of what "Gesponsord" means
- [x] Ranking criteria explanation page (P2B requirement)

### 6.3 Professional Profile / Account ✅ COMPLETE
- [x] Professional vs private individual field (PRO users are businesses)
- [x] Display KvK (Chamber of Commerce) details
- [x] Explain what KvK means for consumers
- [x] Granular privacy settings page (`/settings/privacy`)

### 6.4 Reviews ✅ MOSTLY COMPLETE
- [x] Backend verification (checks job COMPLETED/ACCEPTED)
- [ ] User confirmation step before review (explicit "work done" button)
- [x] Explanation of how reviews are created (FAQ section)
- [x] Objection/removal procedure (FAQ article)

### 6.5 Job Form ✅ COMPLETE
- [x] Data minimization (minimal required fields)
- [x] Contextual explanations per field about data usage

### 6.6 Chat / Messages (Privacy)
- [x] Retention mentioned in privacy policy ("max 2 jaar")
- [ ] Specific chat message retention period
- [ ] User-configurable retention in privacy settings
- [ ] Explicit "no unnecessary monitoring" statement in privacy policy

### 6.7 Registration & Terms ✅ COMPLETE
- [x] Active consent checkbox with links
- [x] Short summary of terms during registration
- [x] Create `#professionals` section in terms page

### 6.8 General Terms (T&C) ✅ MOSTLY COMPLETE
- [x] Platform role explained (Section 3)
- [x] Add concrete example scenario for platform role
- [x] Liability section exists (Section 8)
- [ ] Rewrite liability in plain language with examples

### 6.9 Platform Terms (Professional) ✅ COMPLETE
- [x] Detailed ranking explanation with examples (`/ranking` page)
- [x] Account suspension feature with mandatory reason
- [x] Appeal/objection route for suspensions (`/appeal` page)

### 6.10 Privacy Policy ✅ COMPLETE
- [x] User rights listed (Section 8)
- [x] Make data minimization principle explicit (Section 8a)
- [x] Step-by-step GDPR rights procedure

### 6.11 Support / Help Center (DSA) ✅ COMPLETE
- [x] "Melden" (Report) button on profiles, jobs, messages
- [x] Explanation of what can be reported (in report modal)
- [x] Consolidated complaints procedure (`/complaints` page)

### 6.12 Moderation (Internal) ✅ MOSTLY COMPLETE
- [x] Audit trail/log Prisma model for moderation decisions (ModerationLog model)
- [x] Admin interface for moderation logging (admin/reports page)
- [ ] Document contact point for regulators

### 6.13 Transparency / About Us ✅ MOSTLY COMPLETE
- [x] Contact page exists with email/phone/city
- [x] Add KvK number, full legal name, complete address
- [ ] (Non-MVP) Annual transparency reporting page

---

## Compliance Summary

### ✅ COMPLETE (31 items)
| Feature | Location |
|---------|----------|
| Clickable job in chat | `messages/[id]/page.tsx` |
| Postal code validation | `job-form.tsx` |
| Distance-based filtering | `api/leads/route.ts` |
| Auto-close/reject other PROs | `api/bids/[id]/accept/route.ts` |
| Email notifications | `lib/email.ts` + API routes |
| "Aanbevolen" + "Alle klussen" filter | `pro/jobs/page.tsx` |
| Professional Services page | `pro/services/page.tsx` |
| "Gesponsord" badge | `pro/jobs/page.tsx` |
| Sponsored jobs sorting | `api/leads/route.ts` |
| Platform role on landing | `page.tsx` |
| Visual diagram | `page.tsx` |
| Concrete steps | `page.tsx` |
| Data minimization in form | `job-form.tsx` |
| Active consent checkbox | `register/client` + `register/pro` |
| Terms summary | `register/client` + `register/pro` |
| Backend review verification | `api/reviews/route.ts` |
| Contact page with legal entity | `contact/page.tsx` |
| Report system (DSA) | `api/reports/` + `ReportButton` component |
| Account suspension | `api/admin/users/[id]/suspend/` |
| Appeal system | `appeal/page.tsx` + `api/appeals/` |
| Ranking criteria page | `ranking/page.tsx` |
| "Gesponsord" tooltip | `pro/jobs/page.tsx` |
| KvK display on profiles | `pro/profile/page.tsx` |
| Privacy settings page | `settings/privacy/page.tsx` |
| Data export request | `api/settings/privacy/export/` |
| Review explanation (FAQ) | `faq/page.tsx` |
| Review objection procedure | `faq/page.tsx` |
| Complaints procedure | `complaints/page.tsx` |
| P2B terms section | `terms/page.tsx#professionals` |
| GDPR rights procedure | `privacy/page.tsx` |
| Moderation audit trail | `ModerationLog` Prisma model |

### ⚠️ PARTIAL (3 items)
| Feature | What Exists | What's Missing |
|---------|-------------|----------------|
| Liability in T&C | Section 8 text | Plain language rewrite |
| Retention periods | "2 jaar" mentioned | Specific chat retention, configurability |
| Regulator contact | Moderation system | Document contact point for regulators |

### ❌ NOT STARTED (5 items)
| Feature | Priority | Notes |
|---------|----------|-------|
| User confirmation before review | 🟡 Medium | Explicit "work done" button |
| Chat retention configurability | 🟡 Medium | User-configurable in settings |
| "No monitoring" in privacy policy | 🟢 Low | Statement needed |
| Swipe feature for PROs | 🟢 Low | Nice to have |
| Annual transparency report | ⚪ Non-MVP | DSA for larger platforms |

---

## Priority Order (Recommended)

### 🔴 High Priority (Legal/Compliance Risk) ✅ ALL COMPLETE
1. ✅ Illegal content reporting - "Melden" button + explanation
2. ✅ Account suspension with reason + appeal route
3. ✅ Ranking criteria explanation page
4. ✅ Complete legal entity info (KvK, full address)

### 🟡 Medium Priority (User Trust) ✅ MOSTLY COMPLETE
5. ✅ KvK display on professional profiles
6. ✅ Review explanation + objection procedure
7. ✅ Privacy policy improvements (GDPR steps)
8. ✅ Complaints procedure
9. ⚠️ T&C improvements (examples done, plain language pending)
10. ✅ Privacy settings page
11. ✅ "Gesponsord" explanation tooltip

### 🟢 Lower Priority (Nice to Have)
12. ✅ Contextual data explanations in forms
13. ❌ Configurable retention periods
14. ✅ Moderation audit trail
15. ❌ Swipe feature for PROs
16. ❌ Payment integration

### ⚪ Non-MVP
17. ❌ Annual transparency reporting

---

## Quick Stats

| Status | Count |
|--------|-------|
| ✅ Complete | 31 |
| ⚠️ Partial | 3 |
| ❌ Not Started | 5 |
| **Total** | **39** |

---

## Bug Fixes (All Resolved)

- ✅ Registration validation error - fixed
- ✅ Next.js 14 params compatibility - fixed
- ✅ Prisma client sync - fixed
- ✅ Job visibility after interest - fixed

---

## Current Job Flow

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
