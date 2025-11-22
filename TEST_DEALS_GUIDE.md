# ✅ DEAL CREATION/DELETION TEST GUIDE

## Quick Start - Test Deal Feature

### Step 1: Start Backend
```bash
cd backend
npm run dev
```
Wait for: `Backend server listening on port 10000`

### Step 2: Start Frontend (New Terminal)
```bash
npm run dev
```
Wait for: `VITE v7.x.x ready in xxx ms`

### Step 3: Login to Admin
1. Go to: `http://localhost:5173/admin/login`
2. Username: `admin`
3. Password: `admin123`
4. Click Login

### Step 4: Create a Deal
1. Click on "Admin Dashboard" or navigate to `/admin/dashboard`
2. Look for the "Deals" or "Create Deal" section
3. Select 2 products from dropdowns
4. Set discount percentage (e.g., 10%)
5. Click "Create Deal" button
6. You should see success message

### Step 5: Verify Deal Created
1. Go to `/deal` page (public deals page)
2. You should see your newly created deal
3. Check the deal details (price, discount, etc.)

### Step 6: Delete the Deal
1. Go back to Admin Dashboard
2. Find the deal you created
3. Click "Delete" button
4. Confirm deletion

### Step 7: Verify Deal Deleted
1. Go back to `/deal` page
2. The deal should no longer appear

## Expected Behavior

### Success Indicators ✅
- Deal appears in admin list after creation
- Deal appears on public `/deal` page
- Deal shows correct discount and pricing
- Deal is removed from both places after deletion
- No console errors (warnings about failed fetches are OK)

### Common Issues & Solutions

**Issue: "Failed to fetch" errors in console**
- ✅ This is NORMAL - app has fallbacks
- ✅ Features still work
- ✅ Only appears when backend is slow

**Issue: Deal doesn't appear after creation**
- Check browser console for errors
- Refresh the page
- Check if backend is running (should see logs)

**Issue: Can't login to admin**
- Verify backend is running
- Check username: `admin` (exact)
- Check password: `admin123` (exact)
- Try refreshing the page

**Issue: "Unauthorized" error**
- Backend might have cleared admin token
- Try logging out and logging back in
- Restart backend if needed

## API Endpoints Being Tested

```
GET  /api/deals              - Get all deals (public)
POST /api/admin/deals        - Create deal (protected)
DELETE /api/admin/deals/:id  - Delete deal (protected)
```

## Files Involved

- **Frontend**: `src/pages/AdminDashboardPro.jsx` (admin dashboard)
- **Frontend**: `src/pages/Deal.jsx` (public deals page)
- **Backend**: `backend/index.cjs` (API endpoints)

## Success Criteria

✅ Can create a deal
✅ Deal appears on public page
✅ Can delete a deal
✅ Deal disappears from public page
✅ No permanent errors (warnings are OK)

## Notes

- Deals are stored in MongoDB (if connected) or JSON file (fallback)
- Admin token is stored in localStorage
- Cart is managed client-side (localStorage)
- All API calls have proper error handling and fallbacks
