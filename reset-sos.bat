@echo off
REM SOS Workflow Reset Script for Windows
REM Quick development reset for testing

setlocal enabledelayedexpansion

REM Configuration
set API_URL=http://localhost:5000/api
set EMAIL=%1
set PASSWORD=%2

if "%EMAIL%"=="" set EMAIL=patient@test.com
if "%PASSWORD%"=="" set PASSWORD=password123

echo.
echo ===================================================
echo   SOS Workflow Reset (Development Only)
echo ===================================================
echo.

REM Step 1: Check current state
echo [1/4] Checking current system state...
curl -s "%API_URL%/dev/state"
echo.
echo.

REM Step 2: Login to get token
echo [2/4] Logging in as %EMAIL%...
curl -s -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}" > temp_login.json

REM Extract token using PowerShell
for /f "tokens=*" %%i in ('powershell -Command "(Get-Content temp_login.json | ConvertFrom-Json).data.token"') do set TOKEN=%%i

if "%TOKEN%"=="" (
  echo ERROR: Login failed. Check credentials.
  echo Email: %EMAIL%
  type temp_login.json
  del temp_login.json
  exit /b 1
)

echo Login successful
del temp_login.json
echo.

REM Step 3: Reset SOS workflow
echo [3/4] Resetting SOS workflow...
curl -s -X POST "%API_URL%/dev/reset-sos" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

REM Step 4: Verify reset
echo [4/4] Verifying system state after reset...
curl -s "%API_URL%/dev/state"
echo.
echo.

echo ===================================================
echo   System is ready for fresh SOS testing!
echo ===================================================
echo.

endlocal
