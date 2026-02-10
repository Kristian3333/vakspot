---
description: "Create a detailed plan for a task"
argument-hint: <what to plan>
model: opus
disallowed-tools: Write(src/*), Edit(src/*)
---

Analyze the codebase and create a detailed implementation plan.

## Input
$ARGUMENTS

## Workflow

1. **Read** CLAUDE.md and relevant docs to understand the project
2. **Read** the Prisma schema at `prisma/schema.prisma` to understand the data model
3. **Analyze** affected files in src/ — API routes, components, lib utilities
4. **Check** `lib/job-state-machine.ts` if the task touches job statuses
5. **Design** the approach: what changes, in what order, what could break
6. **TDD plan**: for each piece of work, specify what tests to write FIRST
7. **Security review**: identify any security implications
8. **Save** the plan to `specs/<descriptive-name>.md`

## Plan Structure

The plan MUST include:
- Objective (what and why)
- Files to create/modify (with paths)
- Prisma schema changes (if any) with migration strategy
- TDD sequence: tests to write → code to implement → validation
- Security considerations (auth, input validation, data exposure)
- API contract changes (if any) with backward compatibility notes
- Acceptance criteria (how to verify success)
- Risks and rollback strategy
