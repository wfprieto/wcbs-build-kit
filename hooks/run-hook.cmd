@echo off
setlocal
where bash >nul 2>nul
if errorlevel 1 (
  echo {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"{\"kernel_status\":\"unable_to_transfer\",\"reason\":\"delivery_environment_unresolved\"}"}}
  exit /b 0
)
bash --noprofile --norc "%~dp0session-start"
exit /b 0
