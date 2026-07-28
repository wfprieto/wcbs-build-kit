: << 'CMDBLOCK'
@echo off
setlocal
REM Cross-platform wrapper for extensionless WCBS hook scripts.
REM cmd.exe executes this block; bash consumes it as a no-op here-document.
set "HOOK_DIR=%~dp0"
set "HOOK_NAME=%~1"
if "%HOOK_NAME%"=="" set "HOOK_NAME=session-start"
if exist "C:\Program Files\Git\bin\bash.exe" (
  "C:\Program Files\Git\bin\bash.exe" --noprofile --norc "%HOOK_DIR%%HOOK_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
  "C:\Program Files (x86)\Git\bin\bash.exe" --noprofile --norc "%HOOK_DIR%%HOOK_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
where bash >nul 2>nul
if not errorlevel 1 (
  bash --noprofile --norc "%HOOK_DIR%%HOOK_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
REM No Bash is available. Preserve a valid, harness-specific fail-open payload.
if /I "%~3"=="cursor" (
  echo {"additional_context":"{\"kernel_status\":\"unable_to_transfer\",\"reason\":\"delivery_environment_unresolved\"}"}
) else if /I "%~3"=="github-copilot" (
  echo {"additionalContext":"{\"kernel_status\":\"unable_to_transfer\",\"reason\":\"delivery_environment_unresolved\"}"}
) else (
  echo {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"{\"kernel_status\":\"unable_to_transfer\",\"reason\":\"delivery_environment_unresolved\"}"}}
)
exit /b 0
CMDBLOCK

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
SCRIPT_NAME="${1:-session-start}"
[ "$#" -gt 0 ] && shift
exec bash --noprofile --norc "$SCRIPT_DIR/$SCRIPT_NAME" "$@"
