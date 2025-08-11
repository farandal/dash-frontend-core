@echo off
setlocal

set "PATCHED_UTIL=patch\utils.js"
set "TARGET_UTIL=node_modules\.pnpm\chalk@4.1.2\node_modules\chalk\source\util.js"

copy /Y "%PATCHED_UTIL%" "%TARGET_UTIL%"

endlocal