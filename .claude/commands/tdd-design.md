---
description: "Design tests first from a specification (Step 1 of TDD)"
argument-hint: <feature description or spec file>
model: opus
disallowed-tools: Write(src/*), Edit(src/*)
---

You are designing tests for a feature. You may ONLY create or modify files
in the tests/ directory. You are explicitly forbidden from touching src/.

## Strict TDD — Step 1: Design Tests

### Input
$ARGUMENTS

### Workflow

1. **Understand** the feature specification completely
2. **Read** existing code in src/ to understand interfaces, types, and patterns
3. **Read** the Prisma schema for relevant data models
4. **Read** existing tests in tests/ for patterns and conventions
5. **Design** comprehensive tests that cover:
   - Happy path (expected inputs → expected outputs)
   - Edge cases (empty inputs, boundary values, max limits)
   - Error cases (invalid inputs, missing data, auth failures)
   - Security cases (unauthorized access, malicious input, injection)
   - State machine transitions (if touching job statuses)
6. **Write** all tests to the appropriate files in tests/
   - Unit tests → `tests/unit/`
   - E2E tests → `tests/e2e/`
7. **Verify** tests are syntactically valid: `npx vitest run --reporter=verbose`
   (they should FAIL — the implementation doesn't exist yet)
8. **Report** what you wrote and the expected failure count

### Test Conventions for This Project
- Vitest with `describe` / `it` / `expect`
- Testing Library for component tests
- Playwright for e2e tests
- Mock Prisma client for unit tests
- Mock NextAuth session for auth-dependent tests
- Test names: `it('should [behavior] when [condition]')`

### Test Quality Checklist
- [ ] Every test has a descriptive name
- [ ] Tests are independent — no shared mutable state
- [ ] Tests are deterministic — no randomness or timing
- [ ] Setup and teardown are explicit
- [ ] Assertions are specific (not just `toBeDefined()`)
- [ ] Both positive and negative cases covered
- [ ] Auth/permission checks tested for each protected route

### Output
- List of test files created/modified
- Number of tests written
- Summary of what each test group covers
- Confirmation that all tests FAIL (proving they test real behavior)

DO NOT write any implementation code. Tests only.
