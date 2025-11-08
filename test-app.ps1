# Comprehensive Test Script for Aala Computer Application
# This script tests all critical API endpoints

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Aala Computer - API Test Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:10000"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " PASSED" -ForegroundColor Green
            $script:testsPassed++
            return $response
        } else {
            Write-Host " FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n--- Health Checks ---" -ForegroundColor Yellow
Test-Endpoint -Name "API Ping" -Url "$baseUrl/api/ping"

# Test 2: Product Endpoints
Write-Host "`n--- Product Endpoints ---" -ForegroundColor Yellow
$productsResponse = Test-Endpoint -Name "Get All Products" -Url "$baseUrl/api/products"

if ($productsResponse) {
    $products = $productsResponse.Content | ConvertFrom-Json
    Write-Host "  Found $($products.Length) products" -ForegroundColor Gray
}

# Test 3: Admin Login
Write-Host "`n--- Admin Authentication ---" -ForegroundColor Yellow
$loginBody = @{
    email = "aalacomputerstore@gmail.com"
    password = "karachi123"
}
$loginResponse = Test-Endpoint -Name "Admin Login" -Url "$baseUrl/api/admin/login" -Method POST -Body $loginBody

$token = $null
if ($loginResponse) {
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "  Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
}

# Test 4: Protected Admin Endpoints
if ($token) {
    Write-Host "`n--- Protected Admin Endpoints ---" -ForegroundColor Yellow
    $authHeaders = @{
        "Authorization" = "Bearer $token"
    }
    
    Test-Endpoint -Name "Get Admin Products" -Url "$baseUrl/api/admin/products" -Headers $authHeaders
    Test-Endpoint -Name "Get Admin Stats" -Url "$baseUrl/api/admin/stats" -Headers $authHeaders
} else {
    Write-Host "`nSkipping protected endpoints (no token)" -ForegroundColor Yellow
}

# Test 5: Frontend Static Files
Write-Host "`n--- Frontend Files ---" -ForegroundColor Yellow
Test-Endpoint -Name "Index.html" -Url "$baseUrl/" -ExpectedStatus 200

# Test Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total:  $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "All tests passed! Success" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed! Error" -ForegroundColor Red
    exit 1
}
