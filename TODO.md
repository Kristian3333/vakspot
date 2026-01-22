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

## Phase 3: Database Cleanup (Priority: MEDIUM)

### 3.1 Schema Simplification
- [x] Budget fields optional in validation
- [ ] Consider removing unused JobStatus values
- [ ] Consider removing Review sub-ratings

### 3.2 Seed Data
- [ ] Update seed to create simpler test data

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

### 4.3 Future Features (Backlog)
- [ ] Email notifications
- [ ] PRO verification system
- [ ] Payment integration

---

## Files Changed

### Modified ✅
```
src/app/page.tsx                              # New minimal landing page
src/app/api/jobs/route.ts                     # Auto-publish jobs
src/app/api/bids/route.ts                     # Interest system
src/app/api/pro/profile/route.ts              # Simplified API
src/lib/validations.ts                        # Simplified schemas + registration fix
src/app/(dashboard)/pro/leads/[id]/page.tsx   # Interest button (React 18 fix)
src/app/(dashboard)/pro/jobs/[id]/page.tsx    # Job detail (React 18 fix)
src/app/(dashboard)/messages/[id]/page.tsx    # Messages (React 18 fix)
src/app/(dashboard)/client/jobs/[id]/page.tsx # Client job detail (params fix)
src/app/(dashboard)/pro/profile/edit/page.tsx # Simplified edit
src/components/layout/Header.tsx              # Simplified nav
src/app/faq/page.tsx                          # Enhanced FAQ (consolidated help)
```

### Redirected (Phase 2.3) ✅
```
src/app/how-it-works/page.tsx    # Redirects to /
src/app/categories/page.tsx       # Redirects to /client/jobs/new
src/app/help/page.tsx            # Redirects to /faq
src/app/help/articles/[slug]/    # Redirects to /faq
```

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
10. ⬜ Mobile experience is clean and usable (needs testing)

---

## Summary

**Core simplification is COMPLETE.** The app now follows a simpler flow:

1. **Client** posts a job (single form, auto-published)
2. **PRO** sees jobs → clicks "Ik ben geïnteresseerd" → sends message
3. **Both** chat freely to discuss details and pricing
4. **Client** picks someone from interested PROs

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
