---
description: "Execute a plan from specs/"
argument-hint: <spec-file-name>
model: opus
---

Read the plan from `specs/$ARGUMENTS` (or the most recent spec if no
argument provided) and execute it.

## Execution Instructions

1. Read and understand the full plan
2. Follow the TDD sequence specified in the plan:
   a. Write tests first (in tests/)
   b. Run tests — verify they fail
   c. Implement code (in src/)
   d. Run tests — verify they pass
   e. Run lint + type check — verify clean
3. If Prisma schema changes are in the plan:
   a. Make schema changes
   b. Run `npx prisma generate`
   c. Run `npx prisma migrate dev --name <descriptive-name>`
4. After all tasks complete, run the full validation:
   - `npm test`
   - `npm run lint`
   - `npx tsc --noEmit`
5. Report final status with list of all files changed
