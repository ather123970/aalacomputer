# Simple System Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Testing Admin System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:10000"

# Test 1: Products
Write-Host "1. Testing Products API..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -TimeoutSec 5
    $count = if ($products -is [array]) { $products.Count } else { 0 }
    Write-Host "   SUCCESS - Found $count products" -ForegroundColor Green
} catch {
    Write-Host "   FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Categories
Write-Host "2. Testing Categories API..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method GET -TimeoutSec 5
    $count = if ($categories -is [array]) { $categories.Count } else { 0 }
    Write-Host "   SUCCESS - Found $count categories" -ForegroundColor Green
} catch {
    Write-Host "   FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Prebuilds
Write-Host "3. Testing Prebuilds API..." -ForegroundColor Yellow
try {
    $prebuilds = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds" -Method GET -TimeoutSec 5
    $count = if ($prebuilds -is [array]) { $prebuilds.Count } else { 0 }
    Write-Host "   SUCCESS - Found $count prebuilds" -ForegroundColor Green
} catch {
    Write-Host "   FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Response Time
Write-Host "4. Testing Response Speed..." -ForegroundColor Yellow
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -TimeoutSec 5 | Out-Null
    $stopwatch.Stop()
    $ms = $stopwatch.ElapsedMilliseconds
    Write-Host "   Response time: $ms ms" -ForegroundColor $(if ($ms -lt 1000) { "Green" } else { "Yellow" })
} catch {
    Write-Host "   FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Open http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "Login: aalacomputerstore@gmail.com / karachi123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
