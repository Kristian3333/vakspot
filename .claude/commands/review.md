---
description: "Review recent changes for security, quality, and test coverage"
argument-hint: <optional: specific files or area to review>
model: opus
disallowed-tools: Write, Edit
---

Review the recent changes in this codebase. You may only read — do not modify anything.

## Input
$ARGUMENTS

If no specific area given, review uncommitted changes or recent git history.

## Review Checklist

### Security
- [ ] No hardcoded secrets, keys, or credentials
- [ ] All API input validated with Zod schemas
- [ ] Auth checks on all protected endpoints (using `auth()` from NextAuth)
- [ ] No SQL injection vectors (Prisma parameterized queries only)
- [ ] No XSS vectors (no `dangerouslySetInnerHTML` without sanitization)
- [ ] Stripe webhook signatures verified
- [ ] No sensitive data in logs or client-side state
- [ ] File uploads validated (type, size)
- [ ] CSRF protection via NextAuth

### Test Coverage
- [ ] Every new function/endpoint has tests
- [ ] Tests cover happy path, edge cases, and error cases
- [ ] Auth/permission tests for protected routes
- [ ] Tests are deterministic and independent
- [ ] No tests were modified to pass (TDD violation check)
- [ ] Coverage target (90%) maintained: `npm run test:coverage`

### Code Quality
- [ ] TypeScript strict — no `any` without justification
- [ ] Zod schemas for all external input
- [ ] No broad exception handlers (bare `catch` without logging/rethrowing)
- [ ] No dead code or commented-out code
- [ ] Functions are short and single-purpose
- [ ] Components render one concern
- [ ] ESLint passes clean: `npm run lint`
- [ ] Type check passes: `npx tsc --noEmit`

### VakSpot-Specific
- [ ] Job status changes go through `lib/job-state-machine.ts`
- [ ] Prisma schema changes have a migration
- [ ] API contracts not broken (backward compatible)
- [ ] Dutch user-facing text is correct
- [ ] Email templates render properly

### Scalability
- [ ] No in-memory state (everything in PostgreSQL)
- [ ] Pagination on list endpoints
- [ ] No blocking operations in API routes
- [ ] Database indexes on query columns

## Output
- PASS or FAIL with severity (critical / warning / info)
- Specific issues with file paths and line references
- Recommended fixes for each issue
