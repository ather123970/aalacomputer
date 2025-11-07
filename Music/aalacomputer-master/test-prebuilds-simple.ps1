# Simple Prebuild API Test Script
Write-Host "Testing Admin Prebuilds API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:10000"

# Test 1: Get prebuilds
Write-Host "1. GET Prebuilds:" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds"
    $count = if ($result -is [array]) { $result.Count } else { 1 }
    Write-Host "   SUCCESS: Found $count prebuild(s)" -ForegroundColor Green
    if ($count -gt 0) {
        foreach ($pb in $result) {
            Write-Host "   - $($pb.title): Rs. $($pb.price)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Delete zero-price prebuild if exists
Write-Host "2. DELETE Zero-Price Prebuild:" -ForegroundColor Yellow
try {
    $prebuilds = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds"
    $zeroPricePb = $prebuilds | Where-Object { $_.price -eq 0 }
    
    if ($zeroPricePb) {
        $id = if ($zeroPricePb._id) { $zeroPricePb._id } else { $zeroPricePb.id }
        Write-Host "   Found zero-price prebuild: $($zeroPricePb.title)" -ForegroundColor Gray
        Write-Host "   Deleting ID: $id" -ForegroundColor Gray
        
        $deleteResult = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds/$id" -Method Delete
        Write-Host "   SUCCESS: Deleted" -ForegroundColor Green
    } else {
        Write-Host "   No zero-price prebuilds found" -ForegroundColor Gray
    }
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check final state
Write-Host "3. VERIFY Final State:" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds"
    $count = if ($result -is [array]) { $result.Count } else { if ($result) { 1 } else { 0 } }
    Write-Host "   SUCCESS: $count prebuild(s) remaining" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host "Next: Test in browser at http://localhost:5173/admin/login" -ForegroundColor White
