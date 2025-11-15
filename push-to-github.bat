@echo off
echo ========================================
echo   Pushing to GitHub
echo ========================================
echo.

echo Step 1: Adding all files...
git add .

echo.
echo Step 2: Committing changes...
git commit -m "Production ready: Optimized images, smart filtering, urgency indicators, improved UI/UX"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Push Complete!
echo ========================================
echo.
echo Your code is now on GitHub at:
echo https://github.com/ather123970/aalacomputer
echo.
pause
