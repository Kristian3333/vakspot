# VakSpot - Simplification Plan

## Vision

A **minimalistic Dutch marketplace** connecting clients with tradespeople:
- Client posts a job -> PROs in the area see it -> PRO clicks "I'm interested" -> They message -> Done.

No complex bidding, no price competition, no elaborate workflows.

---

## Phase 1: Simplify Core Flow - COMPLETE

### 1.1 Simplify Job Posting
- [x] Create new single-page job form
- [x] Auto-publish on submit (no DRAFT state)
- [x] Update Job API to handle simplified creation
- [x] Update validation schema: make budget fields optional

### 1.2 Replace "Bid" with "Interest"
- [x] PRO clicks "Ik ben geinteresseerd" button on job detail
- [x] Creates conversation immediately (no amount required)
- [x] PRO writes initial message as part of interest expression
- [x] Update /api/bids to work as interest system

### 1.3 Simplify Messaging
- [x] Conversation starts on interest
- [x] Both parties can message freely after interest

### 1.4 Simplify PRO Profile
- [x] Simplified profile edit page
- [x] Removed KVK requirement from UI

---

## Phase 2: Strip the UI - COMPLETE

### 2.1 New Minimalistic Landing Page
- [x] Two clear paths: "Ik zoek een vakman" / "Ik ben vakman"
- [x] Simple trust indicators
- [x] Clean design with whitespace

### 2.2 Simplify Navigation
- [x] Client nav: Mijn Klussen, Berichten
- [x] PRO nav: Klussen, Berichten, Profiel
- [x] Footer minimal

### 2.3 Hide/Remove Pages
- [x] Admin hidden from nav
- [x] how-it-works -> Redirects to /
- [x] categories -> Redirects to /client/jobs/new
- [x] help -> Redirects to /faq (consolidated)

### 2.4 Simplify Dashboard Pages
- [x] PRO leads detail: simplified with interest button
- [x] PRO leads list: simplified (only category filter)

---

## Phase 3: Database Cleanup - COMPLETE

### 3.1 Schema Simplification
- [x] Budget fields optional in validation
- [x] JobStatus values reviewed - all needed for state tracking
- [x] Review sub-ratings kept as optional fields

### 3.2 Seed Data
- [x] Updated seed to create simpler test data
- [x] Single password (test123) for all test accounts
- [x] Sample job without budget (uses TO_DISCUSS)

---

## Phase 4: Polish - MOSTLY COMPLETE

### 4.1 UX Improvements
- [ ] Mobile-first responsive check (needs manual testing)
- [x] Form validation messages - using Dutch
- [x] Success/error states - all forms have proper feedback

### 4.2 Performance
- [x] Removed unused components:
  - bid-actions.tsx (old accept/reject UI)
  - job-card.tsx (unused card component)
  - job-form.tsx (form built into page)
- [x] Dependencies reviewed - all are in use

### 4.3 Future Features (Backlog)
- [ ] Email notifications
- [ ] PRO verification system
- [ ] Payment integration

---

## Test Accounts (after npm run db:seed)

```
Klant:  klant@test.nl / test123
Vakman: vakman@test.nl / test123
Admin:  admin@vakspot.nl / test123
```

---

## Summary

Simplification is COMPLETE. The app now follows a simple flow:

1. Client posts a job (single form, auto-published)
2. PRO sees jobs -> clicks "Ik ben geinteresseerd" -> sends message
3. Both chat freely to discuss details and pricing
4. Client picks someone from interested PROs

### Remaining Tasks
- Manual mobile responsive testing
- Future: Email notifications, PRO verification, payments
