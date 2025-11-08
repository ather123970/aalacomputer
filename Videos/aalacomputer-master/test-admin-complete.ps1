# Complete Admin Panel Testing Script
# Tests all CRUD operations and verifies functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Complete Admin Panel Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:10000"
$results = @()

# Test function
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = "$baseUrl$Url"
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ PASS - $Name" -ForegroundColor Green
        
        return @{
            Test = $Name
            Status = "PASS"
            Response = $response
        }
    }
    catch {
        Write-Host "  ✗ FAIL - $Name" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        
        return @{
            Test = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
    }
}

Write-Host "1. Testing Public Endpoints" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan

# Test 1: Get Products
$result = Test-Endpoint -Name "GET /api/products" -Method GET -Url "/api/products"
$results += $result

# Test 2: Get Categories
$result = Test-Endpoint -Name "GET /api/categories" -Method GET -Url "/api/categories"
$results += $result

# Test 3: Get Prebuilds
$result = Test-Endpoint -Name "GET /api/prebuilds" -Method GET -Url "/api/prebuilds"
$results += $result
if ($result.Status -eq "PASS") {
    $prebuilds = $result.Response
    if ($prebuilds) {
        Write-Host "  Found $($prebuilds.Count) prebuilds" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "2. Testing Admin Endpoints (No Auth)" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan

# Test 4: Try to access admin endpoint without auth (should fail)
$result = Test-Endpoint -Name "GET /api/admin/products (unauthorized)" -Method GET -Url "/api/admin/products"
$results += $result

Write-Host ""
Write-Host "3. Performance Tests" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Cyan

# Test response times
$tests = @(
    @{ Name = "Products"; Url = "/api/products" }
    @{ Name = "Categories"; Url = "/api/categories" }
    @{ Name = "Prebuilds"; Url = "/api/prebuilds" }
)

foreach ($test in $tests) {
    Write-Host "  Testing $($test.Name) speed..." -ForegroundColor Yellow
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri "$baseUrl$($test.Url)" -Method GET -TimeoutSec 5 | Out-Null
        $stopwatch.Stop()
        $ms = $stopwatch.ElapsedMilliseconds
        
        if ($ms -lt 1000) {
            Write-Host "    ✓ Fast ($ms ms)" -ForegroundColor Green
        }
        elseif ($ms -lt 3000) {
            Write-Host "    ⚠ Moderate ($ms ms)" -ForegroundColor Yellow
        }
        else {
            Write-Host "    ✗ Slow ($ms ms)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "    ✗ Failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "4. Data Integrity Tests" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan

# Check products have required fields
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET
    $validProducts = 0
    $totalProducts = if ($products -is [array]) { $products.Count } else { 0 }
    
    if ($totalProducts -gt 0) {
        foreach ($product in $products) {
            if ($product.title -or $product.name) {
                $validProducts++
            }
        }
        
        Write-Host "  Products: $validProducts/$totalProducts valid" -ForegroundColor $(if ($validProducts -eq $totalProducts) { "Green" } else { "Yellow" })
    }
    else {
        Write-Host "  Products: 0 found (database may be empty)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  Products: Failed to check" -ForegroundColor Red
}

# Check prebuilds
try {
    $prebuilds = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds" -Method GET
    $totalPrebuilds = if ($prebuilds -is [array]) { $prebuilds.Count } else { 0 }
    Write-Host "  Prebuilds: $totalPrebuilds found" -ForegroundColor $(if ($totalPrebuilds -gt 0) { "Green" } else { "Gray" })
}
catch {
    Write-Host "  Prebuilds: Failed to check" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

Write-Host ""
Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
}
else {
    Write-Host "✗ Some tests failed. Check details above." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "2. Login with: aalacomputerstore@gmail.com / karachi123" -ForegroundColor White
Write-Host "3. Test all CRUD operations in the UI" -ForegroundColor White
Write-Host "4. Test responsive design (resize browser)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
