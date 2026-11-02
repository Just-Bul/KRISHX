@echo off
REM Starts the KRISHX backend (Flask) and frontend (Vite) dev servers,
REM each in its own window, so both keep running side by side.

echo Starting backend (Flask, http://localhost:5000)...
start "KRISHX Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python app.py"

echo Starting frontend (Vite, http://localhost:5173)...
start "KRISHX Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both dev servers are launching in separate windows.
