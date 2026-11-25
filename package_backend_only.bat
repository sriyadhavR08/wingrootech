@echo off
cd /d "%~dp0"
title Package Backend for AWS Elastic Beanstalk
color 0a

echo ===============================================================================
echo            PACKAGING BACKEND FOR AWS ELASTIC BEANSTALK
echo ===============================================================================
echo.

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python "%~dp0package_ebs.py"
) else (
    echo [INFO] Python not found in PATH, using PowerShell POSIX fallback...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$src = '%~dp0backend-deploy'; $dest = '%~dp0backend-deploy.zip'; if (Test-Path $dest) { Remove-Item $dest -Force }; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($src, $dest)"
)

echo.
echo ===============================================================================
echo [DONE] backend-deploy.zip is ready for AWS Elastic Beanstalk!
echo ===============================================================================
pause
