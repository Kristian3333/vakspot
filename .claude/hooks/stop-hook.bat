@echo off
REM Stop hook: prevents Claude Code from finishing until all work is done
REM This runs every time the agent tries to complete a task

setlocal enabledelayedexpansion

set "FAILED=0"

REM === Check 1: Uncompleted checklist items ===
if exist "specs\refactor-certificates-profiles-devtools.md" (
    findstr /C:"- [ ]" "specs\refactor-certificates-profiles-devtools.md" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [STOP HOOK] Acceptance criteria not all checked off in specs\refactor-certificates-profiles-devtools.md
        echo [STOP HOOK] Go back and complete unchecked items, then mark them [x]
        set "FAILED=1"
    )
)

REM === Check 2: Tests pass ===
call npm test -- --run 2>nul
if !errorlevel! neq 0 (
    echo [STOP HOOK] Tests are failing. Fix them before finishing.
    set "FAILED=1"
)

REM === Check 3: Lint passes ===
call npm run lint 2>nul
if !errorlevel! neq 0 (
    echo [STOP HOOK] Lint errors found. Fix them before finishing.
    set "FAILED=1"
)

REM === Check 4: TypeScript compiles ===
call npx tsc --noEmit 2>nul
if !errorlevel! neq 0 (
    echo [STOP HOOK] TypeScript errors found. Fix them before finishing.
    set "FAILED=1"
)

if !FAILED! equ 1 (
    echo.
    echo [STOP HOOK] ============================================
    echo [STOP HOOK] NOT DONE YET. Go back and fix the issues above.
    echo [STOP HOOK] ============================================
    exit /b 1
)

echo [STOP HOOK] All checks passed. You may finish.
exit /b 0
