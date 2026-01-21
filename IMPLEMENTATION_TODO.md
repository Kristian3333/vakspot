# VakSpot - Implementation TODO

## Status Legend
- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed

---

## 1. Professional Buttons (Hero Section)
**Issue**: "Gratis klus plaatsen" and "Vakman worden" buttons don't work properly
**Status**: ✅ Completed
**Notes**: Buttons already link to `/client/jobs/new` and `/register/pro` respectively. These pages exist.

---

## 2. Category Icons Click (Homepage)
**Issue**: Clicking on icons like 'schilderwerk' leads to empty/broken pages
**Status**: ⬜ Not Started
**Notes**: Categories link to `/client/jobs/new?category={slug}` which works, but "Alle categorieën bekijken" button links to `/categories` which doesn't exist.
**Files to create**:
- `src/app/categories/page.tsx`

---

## 3. How It Works Page
**Issue**: https://vakspot.vercel.app/how-it-works is empty
**Status**: ⬜ Not Started
**Files to create**:
- `src/app/how-it-works/page.tsx`

---

## 4. Photo Upload Not Working
**Issue**: Upload functionality doesn't work properly
**Status**: ⬜ Not Started
**Root cause**: 
- Form sends `files` (multiple) but API expects `file` (singular)
- API handles single file but form sends multiple files
**Files to modify**:
- `src/app/api/upload/route.ts` - Support multiple file uploads
- `src/components/forms/job-form.tsx` - Fix form data key

---

## 5. Logout Breaks Website
**Issue**: Clicking logout breaks the website
**Status**: ⬜ Not Started
**Root cause**: Using form POST to `/api/auth/signout` but NextAuth v5 handles this differently
**Files to modify**:
- `src/components/layout/header.tsx` - Fix logout implementation
- Create `src/app/api/auth/signout/route.ts` if needed

---

## 6. Profile Page Missing
**Issue**: No profile page for user account
**Status**: ⬜ Not Started
**Notes**: 
- PRO users: `/pro/profile` directory exists but no page.tsx
- CLIENT users: `/profile` doesn't exist at all
- `/settings` page doesn't exist
**Files to create**:
- `src/app/(dashboard)/pro/profile/page.tsx`
- `src/app/(dashboard)/client/profile/page.tsx` OR `src/app/profile/page.tsx`
- `src/app/settings/page.tsx`

---

## 7. Footer Links Empty
**Issue**: All footer links lead to empty pages
**Status**: ⬜ Not Started
**Links needing pages**:

### Platform Section
- `/how-it-works` - Hoe werkt het? (covered in #3)
- `/categories` - Categorieën (covered in #2)
- `/register/pro` - Vakman worden ✅ Already exists

### Support Section
- `/help` - Help center
- `/contact` - Contact
- `/faq` - Veelgestelde vragen

### Legal Section
- `/privacy` - Privacybeleid
- `/terms` - Algemene voorwaarden
- `/cookies` - Cookiebeleid

**Files to create**:
- `src/app/help/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/cookies/page.tsx`

---

## Implementation Order

1. ✅ Fix logout issue (critical - breaks site)
2. ⬜ Fix photo upload (core functionality)
3. ⬜ Create how-it-works page
4. ⬜ Create categories page
5. ⬜ Create profile pages (pro & client)
6. ⬜ Create settings page
7. ⬜ Create help/support pages
8. ⬜ Create legal pages

---

## Progress Log

### Session 1 - [Current Date]
- Created this tracking document
- Starting implementation...
