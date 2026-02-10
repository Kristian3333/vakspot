---
description: "Write code to pass the frozen tests (Step 2 of TDD)"
argument-hint: <description of what to implement>
model: opus
disallowed-tools: Write(tests/*), Edit(tests/*)
---

You are implementing code to pass existing tests. You may ONLY create or
modify files in src/ and prisma/. You are explicitly forbidden from touching tests/.

## Strict TDD — Step 2: Make Tests Pass

The tests have already been written and frozen. They are the specification.
Your job is to write the minimum code needed to make ALL tests pass.

### Input
$ARGUMENTS

### Workflow

1. **Read** all relevant test files to understand what is expected
2. **Read** existing src/ code for patterns, interfaces, and conventions
3. **Read** the Prisma schema for data model context
4. **Implement** the code that makes the tests pass
5. **Run** `npm test` after each meaningful change
6. **If Prisma schema changed**: run `npx prisma generate` then `npx prisma migrate dev`
7. **Run** `npm run lint` — fix all issues
8. **Run** `npx tsc --noEmit` — fix all type errors
9. **Iterate** until ALL tests pass
10. **Report** final results

### Rules

- NEVER ask to modify a test. The tests are frozen.
- If a test seems wrong, flag it in your report but still write code that passes it.
- Write the simplest code that passes. No speculative features.
- Follow existing patterns in the codebase.
- TypeScript strict mode — no `any` unless justified with a comment.
- All API input validated with Zod schemas.
- Job status changes MUST go through `lib/job-state-machine.ts`.
- Auth checks on every protected endpoint.

### Output
- List of files created/modified
- Full test suite results (must be ALL PASSING)
- Lint and type check results (must be clean)
- Prisma migration details (if schema changed)
- Any concerns or flags about test expectations
