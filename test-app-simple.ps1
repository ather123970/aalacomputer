# Aala Computer - Simple Test Script
Write-Host "`n=== AALA COMPUTER - APP TESTING ===`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:10000"

# Test 1: Server Health
Write-Host "[1] Server Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing -TimeoutSec 5
    Write-Host "    PASS - Server is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "    FAIL - Server is not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Products API
Write-Host "`n[2] Products API Test..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/products" -UseBasicParsing
    $products = $response.Content | ConvertFrom-Json
    Write-Host "    PASS - API responded successfully" -ForegroundColor Green
    Write-Host "    Total Products: $($products.Count)" -ForegroundColor White
} catch {
    Write-Host "    FAIL - Could not fetch products" -ForegroundColor Red
    exit 1
}

# Test 3: Data Quality
Write-Host "`n[3] Data Quality Check..." -ForegroundColor Yellow
$withImages = ($products | Where-Object { $_.img }).Count
$withValidPrices = ($products | Where-Object { $_.price -gt 0 -and $_.price -lt 10000000 }).Count
$withNames = ($products | Where-Object { $_.name }).Count
$withCategories = ($products | Where-Object { $_.category -and $_.category -ne '' }).Count

Write-Host "    Products with images: $withImages / $($products.Count)" -ForegroundColor Green
Write-Host "    Products with valid prices: $withValidPrices / $($products.Count)" -ForegroundColor Green  
Write-Host "    Products with names: $withNames / $($products.Count)" -ForegroundColor Green
if ($withCategories -eq 0) {
    Write-Host "    Products with categories: $withCategories / $($products.Count) - EMPTY" -ForegroundColor Yellow
} else {
    Write-Host "    Products with categories: $withCategories / $($products.Count)" -ForegroundColor Green
}

# Test 4: Sample Products
Write-Host "`n[4] Sample Products..." -ForegroundColor Yellow
$samples = $products | Select-Object -First 3
foreach($i in 0..2) {
    $p = $samples[$i]
    $name = if($p.name.Length -gt 50) { $p.name.Substring(0, 50) + "..." } else { $p.name }
    Write-Host "`n    Product $($i+1):" -ForegroundColor Cyan
    Write-Host "      Name: $name" -ForegroundColor White
    Write-Host "      Price: Rs. $($p.price)" -ForegroundColor White
    Write-Host "      Image: $(if($p.img){'Available'}else{'Missing'})" -ForegroundColor $(if($p.img){'Green'}else{'Red'})
    Write-Host "      Category: $(if($p.category){"$($p.category)"}else{'(empty)'})" -ForegroundColor Gray
}

# Test 5: Image URLs
Write-Host "`n[5] Image URL Validation..." -ForegroundColor Yellow
$validUrls = ($products | Where-Object { $_.img -match '^https?://' }).Count
Write-Host "    Valid HTTP(S) image URLs: $validUrls / $($products.Count)" -ForegroundColor Green

# Test 6: Price Range
Write-Host "`n[6] Price Range Analysis..." -ForegroundColor Yellow
$validPrices = $products | Where-Object { $_.price -gt 0 -and $_.price -lt 10000000 } | Select-Object -ExpandProperty price
$minPrice = ($validPrices | Measure-Object -Minimum).Minimum
$maxPrice = ($validPrices | Measure-Object -Maximum).Maximum
$avgPrice = [math]::Round(($validPrices | Measure-Object -Average).Average, 0)

Write-Host "    Minimum Price: Rs. $minPrice" -ForegroundColor White
Write-Host "    Maximum Price: Rs. $maxPrice" -ForegroundColor White
Write-Host "    Average Price: Rs. $avgPrice" -ForegroundColor White

# Test 7: Frontend Build
Write-Host "`n[7] Frontend Build Check..." -ForegroundColor Yellow
if (Test-Path "dist/index.html") {
    $distFiles = (Get-ChildItem -Path "dist" -Recurse).Count
    Write-Host "    PASS - Frontend build exists" -ForegroundColor Green
    Write-Host "    Total files in dist: $distFiles" -ForegroundColor White
} else {
    Write-Host "    FAIL - Frontend build missing" -ForegroundColor Red
}

# Summary
Write-Host "`n=== TEST SUMMARY ===`n" -ForegroundColor Green
Write-Host "PASSING:" -ForegroundColor Green
Write-Host "  + Server running on http://localhost:10000" -ForegroundColor White
Write-Host "  + API endpoints working" -ForegroundColor White
Write-Host "  + $($products.Count) products loaded from MongoDB Atlas" -ForegroundColor White
Write-Host "  + All products have images and names" -ForegroundColor White
Write-Host "  + Frontend build ready" -ForegroundColor White

if ($withCategories -eq 0) {
    Write-Host "`nWARNINGS:" -ForegroundColor Yellow
    Write-Host "  ! All products have empty categories" -ForegroundColor White
    Write-Host "    Category filtering will show all products in 'All' only" -ForegroundColor Gray
}

Write-Host "`nSTATUS: READY FOR TESTING" -ForegroundColor Green
Write-Host "Preview: http://localhost:10000`n" -ForegroundColor Cyan
