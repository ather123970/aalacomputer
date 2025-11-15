# Test Production Images Script
# This script tests if images are being served correctly from your Render deployment

param(
    [string]$BaseUrl = "https://aalacomputer.onrender.com"
)

Write-Host "🔍 Testing Image Serving on Production..." -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n" -ForegroundColor Gray

# Test 1: API Test Endpoint
Write-Host "1️⃣ Testing /api/test-images endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-images" -Method Get
    Write-Host "✅ Success! Found image directories:" -ForegroundColor Green
    $response.imageDirectories | ForEach-Object {
        Write-Host "  - $($_.path): $($_.totalFiles) files" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Direct Image Access
Write-Host "2️⃣ Testing direct image access..." -ForegroundColor Yellow
$testImages = @(
    "AMD Ryzen 5 3600 Desktop Processor.jpg",
    "ASUS ROG Strix GeForce RTX 3070 8GB GDDR6 PCI Express 4.0 Graphics Card.jpg",
    "placeholder.png"
)

foreach ($image in $testImages) {
    $encodedImage = [System.Web.HttpUtility]::UrlEncode($image)
    $imageUrl = "$BaseUrl/images/$encodedImage"
    
    try {
        $response = Invoke-WebRequest -Uri $imageUrl -Method Head -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $size = if ($response.Headers.'Content-Length') { 
                "{0:N2} KB" -f ([int]$response.Headers.'Content-Length'[0] / 1024) 
            } else { 
                "Unknown" 
            }
            Write-Host "  ✅ $image" -ForegroundColor Green
            Write-Host "     Size: $size | Type: $($response.Headers.'Content-Type')" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ❌ $image - Not Found" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Products API
Write-Host "3️⃣ Testing products API for image URLs..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$BaseUrl/api/products?limit=5" -Method Get
    $productsList = if ($products.products) { $products.products } else { $products }
    
    if ($productsList -and $productsList.Count -gt 0) {
        Write-Host "✅ Found $($productsList.Count) products" -ForegroundColor Green
        $productsList | Select-Object -First 3 | ForEach-Object {
            $imgUrl = if ($_.img) { $_.img } elseif ($_.imageUrl) { $_.imageUrl } else { "No image" }
            Write-Host "  - $($_.Name): $imgUrl" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️ No products found" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Health Check
Write-Host "4️⃣ Testing server health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/ping" -Method Get
    if ($health.ok) {
        Write-Host "✅ Server is healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Server responded but health check failed" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "`n📋 Summary" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Gray
Write-Host "If all tests pass ✅, your images are working correctly!" -ForegroundColor Green
Write-Host "If tests fail ❌, check the Render deployment logs." -ForegroundColor Yellow
Write-Host "`nTo check logs:" -ForegroundColor White
Write-Host "  1. Go to https://dashboard.render.com" -ForegroundColor Gray
Write-Host "  2. Click on your 'aalacomputer' service" -ForegroundColor Gray
Write-Host "  3. Check the 'Logs' tab for build and runtime logs" -ForegroundColor Gray
Write-Host "`nLook for these messages in logs:" -ForegroundColor White
Write-Host "  - '[copy-images] Found 564 files in zah_images'" -ForegroundColor Gray
Write-Host "  - '[server] serving /images from dist/images (564 files)'" -ForegroundColor Gray
Write-Host ""
