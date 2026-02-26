@echo off
REM Run backend (nodemon if available) and serve frontend via Python HTTP server

REM Start backend in new window
start "Backend" cmd /k "cd /d "%~dp0backend" && if exist node_modules\nodemon\bin\nodemon.js (npx nodemon index.js) else (node index.js)"

REM Start frontend in new window (http://localhost:5500)
start "Frontend" cmd /k "cd /d "%~dp0frontend" && python -m http.server 5500"

echo Launched backend and frontend. Close windows when finished.
pause
