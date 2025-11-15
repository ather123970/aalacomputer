@echo off
echo.
echo ========================================
echo  RESTARTING BACKEND SERVER
echo ========================================
echo.

echo Stopping existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Stopped running Node processes
) else (
    echo No Node processes were running
)

echo.
echo Starting backend server...
echo.
echo ========================================
echo  BACKEND SERVER STARTING
echo  Keep this window OPEN
echo ========================================
echo.

npm run backend
pause
