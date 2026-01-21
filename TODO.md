# VakSpot - TODO

## Medium Priority

### Messaging System Improvements
- [ ] Real-time updates (WebSocket - polling is implemented)
- [ ] Message notifications (push/email)

### Email Notifications
- [ ] Set up Resend integration
- [ ] New bid notification to client
- [ ] Bid accepted notification to pro
- [ ] New message notification
- [ ] Welcome email on registration

---

## Low Priority

### Polish & UX
- [ ] SEO metadata for all pages
- [ ] Image optimization

### Testing
- [ ] Unit tests for utilities
- [ ] Unit tests for API routes
- [ ] E2E tests for critical flows (registration, job posting, bidding)
- [ ] Integration tests for auth flow

### Performance
- [ ] Implement proper caching
- [ ] Optimize database queries
- [ ] Add indexes to Prisma schema
- [ ] Image lazy loading

### Future Features
- [ ] Pro verification system
- [ ] Payment integration
- [ ] Calendar/scheduling
- [ ] Mobile app (React Native)
- [ ] Advanced matching algorithm
- [ ] Pro subscription tiers

---

## Bugs to Fix

- [ ] Verify logout flow works correctly
- [ ] Test all form validations
- [ ] Check mobile responsiveness on all pages
- [ ] Verify Vercel Blob uploads work in production

---

## Content Needed

- [ ] Real category icons/images
- [ ] Marketing copy for landing page
- [ ] FAQ content expansion
- [ ] Legal review for terms/privacy/cookies

---

## Completed ✅

### Core Features
- User registration (client & pro)
- Login/logout flow
- Job posting with multi-step form
- Pro leads feed with filters
- Bid submission
- Basic messaging
- All static pages (how-it-works, categories, contact, FAQ, help, privacy, terms, cookies)
- Profile and settings pages
- Admin dashboard (basic)
- Middleware for protected routes
- API routes for all core features
- Deployment to Vercel

### Admin
- Admin categories page
- Admin users page
- Admin verify page
- Admin reports page
- Admin statistics API

### Profiles
- Client profile edit page
- Pro profile edit page

### Reviews System
- Review page with form
- Display average rating on pro profile
- Reviews list on pro profile page
- Prevent multiple reviews per job

### Bid Acceptance Flow
- Accept/reject bid buttons (BidActions component)
- Accept bid API endpoint
- Reject bid API endpoint
- Job status update when bid accepted
- Auto-reject other bids when one is accepted
- Conversation creation on bid acceptance

### Photo Upload
- Multi-file upload support in API
- Form handles multiple files
- Vercel Blob integration

### Help Center
- All 18 help center articles (via dynamic route with full Dutch content)

### Messaging
- Unread message count in header (UnreadBadge component)
- Polling for unread count (30s interval)
- Unread count API endpoint

### UX Improvements
- Toast notification system (ToastProvider)
- Loading skeletons for key pages:
  - Client jobs list
  - Pro leads list
  - Pro profile
  - Messages
  - Admin dashboard
- Error boundaries (dashboard & global)
- 404 Not Found page
