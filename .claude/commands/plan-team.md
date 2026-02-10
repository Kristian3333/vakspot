---
description: "Create an implementation plan with agent team assignments"
argument-hint: <what to build> <how to split the team>
model: opus
disallowed-tools: Write(src/*), Edit(src/*), Write(tests/*), Edit(tests/*)
---

Create a detailed implementation plan AND assign agent teams to execute it.

## Input
$ARGUMENTS

## Workflow

1. **Read** CLAUDE.md for project context and conventions
2. **Read** `prisma/schema.prisma` for data model
3. **Analyze** the codebase to understand what exists and what needs changing
4. **Break the work into independent streams** — each stream should touch different files/directories to avoid conflicts
5. **For each stream, assign a builder + validator pair**
6. **Define dependencies** — what must finish before what can start
7. **Save** the plan to `specs/<plan-name>.md`

## Plan Template

Save this format:

```markdown
# [Plan Name]

## Objective
[What we're building and why]

## Work Streams

### Stream 1: [Name] — [Area, e.g., "API Layer"]
**Files**: [list of files this stream owns]
**Builder**: builder-[name] (Sonnet)
**Validator**: validator-[name] (Sonnet)
**Tasks**:
1. Write tests for [specific thing] → tests/unit/[path]
2. Implement [specific thing] → src/[path]
3. Validate: tests pass, lint clean, types clean

### Stream 2: [Name] — [Area]
**Files**: [list — NO overlap with Stream 1]
**Builder**: builder-[name]
**Validator**: validator-[name]
**Depends on**: [Stream 1, if needed, otherwise "none"]
**Tasks**:
1. ...

### Stream N: Integration
**Depends on**: all previous streams
**Tasks**:
1. Run full test suite
2. Run build: `npm run build`
3. Verify no regressions

## Execution Order
- Parallel: Stream 1 + Stream 2 (no file overlap)
- Sequential: Stream 3 after Stream 1 (depends on API contracts)
- Final: Integration after all streams complete

## File Ownership (CRITICAL — no overlaps)
| Stream | Owns |
|--------|------|
| Stream 1 | src/app/api/[area]/, tests/unit/api/[area]/ |
| Stream 2 | src/components/[area]/, tests/unit/components/[area]/ |
| Stream 3 | src/lib/[area]/, tests/unit/lib/[area]/ |

## Acceptance Criteria
- [ ] All tests pass: `npm test`
- [ ] Lint clean: `npm run lint`
- [ ] Types clean: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] No regressions in existing functionality
```

## Rules
- NEVER assign two streams to the same files — file conflicts break everything
- Each stream must be independently testable
- TDD within each stream: tests first, then code
- Prisma schema changes go in their own stream (they block everything else)
- Keep streams to 3-5 maximum — more than that and coordination overhead kills the benefit
