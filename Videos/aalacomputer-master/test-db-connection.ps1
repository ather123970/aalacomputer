# Test Database Connection
Write-Host "Testing Database Connection..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:10000"

# Test database status
Write-Host "1. Checking Database Status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/db-status" -Method GET -TimeoutSec 5
    Write-Host "   Database Connected: $($status.connected)" -ForegroundColor $(if ($status.connected) { "Green" } else { "Red" })
    Write-Host "   Ready State: $($status.readyStateText)" -ForegroundColor $(if ($status.connected) { "Green" } else { "Red" })
    Write-Host "   Database: $($status.name)" -ForegroundColor Gray
    Write-Host "   Host: $($status.host)" -ForegroundColor Gray
    Write-Host "   Models: $($status.models -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing Product Count..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -TimeoutSec 5
    $count = if ($products -is [array]) { $products.Count } else { 0 }
    Write-Host "   Found $count products in database" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Status Check Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Try updating a product in admin panel" -ForegroundColor White
Write-Host "URL: http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "Watch backend terminal for detailed logs!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
