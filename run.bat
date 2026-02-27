@echo off
REM Navigate to project directory
cd /d "%~dp0"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start the server
echo Starting server on http://localhost:3000
timeout /t 2
start http://localhost:3000
node server/index.js

pause
