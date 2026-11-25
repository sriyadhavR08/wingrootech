@echo off
setlocal enabledelayedexpansion

title Wingroo Technologies - Production Build ^& Packaging System
color 0b

echo ===============================================================================
echo        WINGROO TECHNOLOGIES - PRODUCTION BUILD ^& PACKAGING SYSTEM
echo ===============================================================================
echo.
echo Current Directory: %~dp0
echo.

set "ROOT_DIR=%~dp0"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "FRONTEND_DIST=%ROOT_DIR%frontend-dist"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "BACKEND_DEPLOY=%ROOT_DIR%backend-deploy"
set "FRONTEND_ZIP=%ROOT_DIR%frontend-dist.zip"
set "BACKEND_ZIP=%ROOT_DIR%backend-deploy.zip"

echo -------------------------------------------------------------------------------
echo [STEP 1/5] Checking Node.js and NPM...
echo -------------------------------------------------------------------------------
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] NPM was not found in PATH!
    echo Please make sure Node.js is installed on your computer.
    echo.
    pause
    exit /b 1
)
echo Node.js / NPM is available.

echo.
echo -------------------------------------------------------------------------------
echo [STEP 2/5] Compiling Production Frontend (Vite Build)...
echo Production API: https://backend.wingrootechnologies.com
echo -------------------------------------------------------------------------------
cd /d "%FRONTEND_DIR%"
call npm run build

if not exist "%FRONTEND_DIR%\dist\index.html" (
    echo.
    echo [ERROR] Build output "%FRONTEND_DIR%\dist\index.html" was not created!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Frontend compilation completed! Output is in frontend\dist.

echo.
echo -------------------------------------------------------------------------------
echo [STEP 3/5] Updating frontend-dist Folder...
echo -------------------------------------------------------------------------------
if not exist "%FRONTEND_DIST%" mkdir "%FRONTEND_DIST%"
robocopy "%FRONTEND_DIR%\dist" "%FRONTEND_DIST%" /E /PURGE /NFL /NDL /NJH /NJS /nc /ns /np
echo [SUCCESS] frontend-dist folder updated with latest build assets.

echo.
echo -------------------------------------------------------------------------------
echo [STEP 4/5] Synchronizing Backend to backend-deploy...
echo -------------------------------------------------------------------------------
if not exist "%BACKEND_DEPLOY%" mkdir "%BACKEND_DEPLOY%"
robocopy "%BACKEND_DIR%" "%BACKEND_DEPLOY%" /E /XD instance uploads __pycache__ .pytest_cache .git .idea /XF .env *.pyc *.log /NFL /NDL /NJH /NJS /nc /ns /np
echo [SUCCESS] backend-deploy folder synchronized with latest backend code.

echo.
echo -------------------------------------------------------------------------------
echo [STEP 5/5] Creating AWS Linux-Compatible ZIP Archives (POSIX Forward Slashes)...
echo -------------------------------------------------------------------------------
cd /d "%ROOT_DIR%"
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python "%ROOT_DIR%package_ebs.py"
) else (
    echo [INFO] Python not found in PATH, using PowerShell POSIX fallback...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$src = '%BACKEND_DEPLOY%'; $dest = '%BACKEND_ZIP%'; if (Test-Path $dest) { Remove-Item $dest -Force }; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($src, $dest)"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$src = '%FRONTEND_DIST%'; $dest = '%FRONTEND_ZIP%'; if (Test-Path $dest) { Remove-Item $dest -Force }; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($src, $dest)"
)

echo.
echo ===============================================================================
echo                ALL PRODUCTION FILES HAVE BEEN BUILT ^& PACKAGED!
echo ===============================================================================
echo.
echo Ready for Production Deployment:
echo  1. backend-deploy.zip  --^> UPLOAD THIS TO AWS ELASTIC BEANSTALK!
echo     * Fixed: POSIX forward slashes ('/') so Linux unzip succeeds with 0 warnings!
echo     * Fixed: Health check routes '/', '/health', '/api/health' all return 200 OK!
echo     * Fixed: Added .ebextensions/01_health.config for ALB target group!
echo     * Fixed: Added gunicorn --workers 3 --timeout 120 in Procfile!
echo.
echo  2. frontend-dist.zip   --^> Upload to Netlify / S3 / CloudFront / cPanel!
echo.
echo ===============================================================================
pause
