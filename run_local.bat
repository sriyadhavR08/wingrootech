@echo off
title Wingroo Technologies - Local Development Environment
color 0a

echo ===============================================================================
echo        WINGROO TECHNOLOGIES - LOCAL DEVELOPMENT SERVERS
echo ===============================================================================
echo.
echo Current Directory: %~dp0
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [1/3] Checking Prerequisites...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Python was not found in PATH!
) else (
    echo [OK] Python is available.
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] NPM was not found in PATH!
) else (
    echo [OK] Node.js / NPM is available.
)

echo.
echo [2/3] Starting Flask Backend on Port 5000...
start "Wingroo Backend API (Port 5000)" cmd /k "cd /d "%BACKEND_DIR%" && python app.py"

echo [3/3] Starting Vite Frontend on Port 5173...
start "Wingroo Frontend UI (Port 5173)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ===============================================================================
echo            LOCAL DEVELOPMENT SERVERS LAUNCHED SUCCESSFULLY!
echo ===============================================================================
echo.
echo Local URLs:
echo  * Frontend Website:     http://localhost:5173/
echo  * Candidate Portal:     http://localhost:5173/internship/login
echo  * Admin Portal:         http://localhost:5173/internship/admin-login
echo  * Certificate Verify:   http://localhost:5173/internship/verify
echo  * Backend API Health:   http://127.0.0.1:5000/
echo.
echo Both servers are running in their respective command windows.
echo You can now develop and add your new feature!
echo ===============================================================================
echo.

timeout /t 3 >nul
start http://localhost:5173/

pause
