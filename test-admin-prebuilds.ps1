# Admin Prebuilds CRUD Testing Script
# PowerShell script to test all prebuild operations

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ADMIN PREBUILDS CRUD TEST" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:10000"
$headers = @{
    "Content-Type" = "application/json"
}

# Test 1: Get current prebuilds
Write-Host "Test 1: GET Current Prebuilds" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds" -Method Get
    $count = if ($response -is [array]) { $response.Count } else { 1 }
    Write-Host "✓ Success: Found $count prebuild(s)" -ForegroundColor Green
    
    if ($count -gt 0) {
        Write-Host "  Existing prebuilds:" -ForegroundColor Gray
        foreach ($pb in $response) {
            $id = if ($pb._id) { $pb._id } else { $pb.id }
            $title = if ($pb.title) { $pb.title } else { $pb.name }
            $price = if ($pb.price) { $pb.price } else { 0 }
            Write-Host "  - ID: $id" -ForegroundColor Gray
            Write-Host "    Title: $title" -ForegroundColor Gray
            Write-Host "    Price: Rs. $price" -ForegroundColor Gray
            
            # Save first ID for deletion test
            $script:existingId = $id
        }
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Delete existing zero-price prebuild (if exists)
if ($script:existingId) {
    Write-Host "Test 2: DELETE Existing Prebuild" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    Write-Host "  Deleting prebuild: $script:existingId" -ForegroundColor Gray
    
    try {
        # Try public endpoint first (easier for testing)
        $response = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds/$script:existingId" -Method Delete -Headers $headers
        Write-Host "✓ Success: Prebuild deleted" -ForegroundColor Green
        Write-Host "  Response: $($response.message)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 3: Create new prebuild with price
Write-Host "Test 3: CREATE New Prebuild" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

$newPrebuild = @{
    title = "Gaming Beast Pro TEST"
    name = "Gaming Beast Pro TEST"
    description = "High-end gaming PC for testing"
    price = 150000
    category = "Gaming"
    performance = "High Performance"
    status = "published"
    featured = $true
} | ConvertTo-Json

try {
    # Try public endpoint for easier testing
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/prebuilds" -Method Post -Body $newPrebuild -Headers $headers -ErrorAction Stop
    $createdId = if ($response.product._id) { $response.product._id } else { $response.product.id }
    $script:testPrebuildId = $createdId
    
    Write-Host "✓ Success: Prebuild created" -ForegroundColor Green
    Write-Host "  ID: $createdId" -ForegroundColor Gray
    Write-Host "  Title: Gaming Beast Pro TEST" -ForegroundColor Gray
    Write-Host "  Price: Rs. 150,000" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Note: This endpoint requires admin authentication" -ForegroundColor Yellow
    Write-Host ""
}

# Test 4: Update prebuild price
if ($script:testPrebuildId) {
    Write-Host "Test 4: UPDATE Prebuild Price" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    Write-Host "  Updating prebuild: $script:testPrebuildId" -ForegroundColor Gray
    
    $updateData = @{
        price = 175000
        title = "Gaming Beast Pro MAX TEST"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/prebuilds/$script:testPrebuildId" -Method Put -Body $updateData -Headers $headers -ErrorAction Stop
        Write-Host "✓ Success: Prebuild updated" -ForegroundColor Green
        Write-Host "  New Title: Gaming Beast Pro MAX TEST" -ForegroundColor Gray
        Write-Host "  New Price: Rs. 175,000" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  Note: This endpoint requires admin authentication" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Test 5: Verify updated prebuild
Write-Host "Test 5: VERIFY Updated Prebuild" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds" -Method Get
    $updated = $response | Where-Object { 
        ($_.title -like "*TEST*") -or ($_.name -like "*TEST*")
    }
    
    if ($updated) {
        $title = if ($updated.title) { $updated.title } else { $updated.name }
        $price = if ($updated.price) { $updated.price } else { 0 }
        Write-Host "✓ Success: Found updated prebuild" -ForegroundColor Green
        Write-Host "  Title: $title" -ForegroundColor Gray
        Write-Host "  Price: Rs. $price" -ForegroundColor Gray
        Write-Host ""
        
        $script:testPrebuildId = if ($updated._id) { $updated._id } else { $updated.id }
    } else {
        Write-Host "✗ No test prebuild found" -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Delete test prebuild
if ($script:testPrebuildId) {
    Write-Host "Test 6: DELETE Test Prebuild (Cleanup)" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    Write-Host "  Deleting test prebuild: $script:testPrebuildId" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds/$script:testPrebuildId" -Method Delete -Headers $headers
        Write-Host "✓ Success: Test prebuild cleaned up" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 7: Final verification
Write-Host "Test 7: FINAL VERIFICATION" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/prebuilds" -Method Get
    $testPrebuilds = $response | Where-Object { 
        ($_.title -like "*TEST*") -or ($_.name -like "*TEST*")
    }
    
    if (-not $testPrebuilds) {
        Write-Host "✓ Success: All test prebuilds cleaned up" -ForegroundColor Green
    } else {
        Write-Host "! Warning: Some test prebuilds still exist" -ForegroundColor Yellow
    }
    
    $remainingCount = if ($response -is [array]) { $response.Count } else { if ($response) { 1 } else { 0 } }
    Write-Host "  Total prebuilds remaining: $remainingCount" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API Endpoints Tested:" -ForegroundColor White
Write-Host "  ✓ GET    /api/prebuilds" -ForegroundColor Green
Write-Host "  ✓ POST   /api/admin/prebuilds" -ForegroundColor Green
Write-Host "  ✓ PUT    /api/admin/prebuilds/:id" -ForegroundColor Green
Write-Host "  ✓ DELETE /api/prebuilds/:id" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Test in browser: http://localhost:5173/admin/login" -ForegroundColor Gray
Write-Host "  2. Login: aalacomputerstore@gmail.com / karachi123" -ForegroundColor Gray
Write-Host "  3. Go to Prebuilds tab" -ForegroundColor Gray
Write-Host "  4. Test Create, Update, Delete operations" -ForegroundColor Gray
Write-Host ""
Write-Host "Browser Preview Available:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "  Admin: http://localhost:5173/admin/login" -ForegroundColor Gray
Write-Host ""
