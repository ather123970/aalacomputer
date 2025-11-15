# RESTART BACKEND SERVER
# This script stops any running Node processes and starts the backend fresh

Write-Host "`n🔄 Restarting Backend Server..." -ForegroundColor Cyan
Write-Host "=" * 70

# Step 1: Stop all Node processes
Write-Host "`n1. Stopping existing Node processes..."
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node process(es). Stopping..."
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Stopped" -ForegroundColor Green
} else {
    Write-Host "   No Node processes running" -ForegroundColor Yellow
}

# Step 2: Start backend server
Write-Host "`n2. Starting backend server..."
Write-Host "   Location: $PSScriptRoot"
Write-Host "   Command: npm run backend"
Write-Host "`n" + ("=" * 70)
Write-Host "⚠️  Keep this window open - Backend server will start below" -ForegroundColor Yellow
Write-Host ("=" * 70) + "`n"

# Change to script directory and run backend
Set-Location $PSScriptRoot
& npm run backend
