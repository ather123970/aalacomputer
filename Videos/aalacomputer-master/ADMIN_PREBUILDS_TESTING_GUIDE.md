# 🧪 Complete Admin Prebuilds Testing Guide

## ✅ Price Input Added

**New Feature:** Manual price input field in prebuild creation/edit form

---

## 🎯 Testing Checklist

Test all CRUD operations in order:

### ✅ 1. CREATE Prebuild (with Price)
### ✅ 2. UPDATE Prebuild
### ✅ 3. DELETE Single Prebuild
### ✅ 4. CLEAR ALL Prebuilds

---

## 📋 Test 1: CREATE Prebuild (5 minutes)

### **Steps:**

#### 1. Navigate to Admin Panel
```
1. Go to: http://localhost:5173/admin/login
2. Login with:
   - Email: aalacomputerstore@gmail.com
   - Password: karachi123
3. ✅ Should see Admin Dashboard
```

#### 2. Go to Prebuilds Section
```
1. Click "Prebuilds" tab in admin navigation
2. ✅ Should see "Prebuilds Management" page
3. ✅ Should see "Add Prebuild" button
```

#### 3. Create First Test Prebuild
```
1. Click "Add Prebuild" button (blue button, top-right)
2. ✅ Modal should open with form

Fill in the form:
┌─────────────────────────────────────────┐
│ Title:           Gaming Beast Pro       │
│ Category:        Gaming                 │
│ Description:     High-end gaming PC     │
│ Price (Rs.):     150000                 │ ← NEW FIELD!
│ Performance:     High Performance       │
│ Image URL:       (leave empty for now) │
│ ☐ Featured                              │
│ ☑ Publish                               │
└─────────────────────────────────────────┘

3. Click "Create" button
4. ✅ Modal should close
5. ✅ Success message: "Prebuild created!"
6. ✅ New prebuild card should appear
```

#### 4. Verify Created Prebuild
```
Check the card shows:
✅ Title: "Gaming Beast Pro"
✅ Price: "Rs. 150,000"
✅ Category: "Gaming"
✅ Status: "published" (green badge)
✅ Description visible
```

#### 5. Create Second Test Prebuild
```
Click "Add Prebuild" again

Fill in:
┌─────────────────────────────────────────┐
│ Title:           Budget Office PC       │
│ Category:        Office                 │
│ Description:     Perfect for work       │
│ Price (Rs.):     60000                  │
│ Performance:     Standard Performance   │
│ Image URL:       (leave empty)          │
│ ☐ Featured                              │
│ ☑ Publish                               │
└─────────────────────────────────────────┘

Click "Create"
✅ Should now have 2 prebuilds
```

#### 6. Create Third Test Prebuild (Draft)
```
Click "Add Prebuild" again

Fill in:
┌─────────────────────────────────────────┐
│ Title:           Workstation Pro        │
│ Category:        Workstation            │
│ Description:     For professionals      │
│ Price (Rs.):     200000                 │
│ Performance:     Ultra High Performance │
│ Image URL:       (leave empty)          │
│ ☐ Featured                              │
│ ☐ Publish        ← LEAVE UNCHECKED      │
└─────────────────────────────────────────┘

Click "Create"
✅ Should now have 3 prebuilds
✅ Last one should show "draft" badge (gray)
```

---

## 📝 Test 2: UPDATE Prebuild (3 minutes)

### **Steps:**

#### 1. Edit First Prebuild
```
1. Find "Gaming Beast Pro" card
2. Click the blue edit icon (pencil) ✏️
3. ✅ Modal should open with existing data filled
```

#### 2. Update Details
```
Change the following:
┌─────────────────────────────────────────┐
│ Title:           Gaming Beast Pro MAX   │ ← CHANGED
│ Category:        Gaming                 │
│ Description:     Ultimate gaming setup  │ ← CHANGED
│ Price (Rs.):     175000                 │ ← CHANGED
│ Performance:     Ultra High Performance │ ← CHANGED
│ Image URL:       (leave empty)          │
│ ☑ Featured       ← CHECK THIS           │
│ ☑ Publish                               │
└─────────────────────────────────────────┘

Click "Update"
```

#### 3. Verify Update
```
Check the card now shows:
✅ Title changed to "Gaming Beast Pro MAX"
✅ Price changed to "Rs. 175,000"
✅ ⭐ Featured star icon visible
✅ Performance updated
```

#### 4. Test Price Update Only
```
1. Click edit on "Budget Office PC"
2. Change ONLY the price:
   - Price: 65000 → 55000
3. Click "Update"
4. ✅ Price should update to Rs. 55,000
5. ✅ Everything else stays the same
```

---

## 🗑️ Test 3: DELETE Single Prebuild (2 minutes)

### **Steps:**

#### 1. Delete Draft Prebuild
```
1. Find "Workstation Pro" (draft status)
2. Click red trash icon 🗑️
3. ✅ Confirmation dialog: "Delete this prebuild?"
4. Click "OK"
5. ✅ Success message: "Prebuild deleted successfully!"
6. ✅ Card disappears from list
7. ✅ Should now have 2 prebuilds (Gaming Beast Pro MAX, Budget Office PC)
```

#### 2. Verify Deletion
```
✅ Workstation Pro is gone
✅ Other prebuilds remain
✅ No errors in console
```

---

## 🧹 Test 4: CLEAR ALL Prebuilds (2 minutes)

### **Steps:**

#### 1. Use Clear All Button
```
1. Look for "Clear All" button (should be near Add Prebuild)
2. Click "Clear All (2)" button
3. ✅ Confirmation dialog: "Delete all 2 prebuilds? This cannot be undone!"
4. Click "OK"
5. ✅ Loading indicator appears
6. ✅ Success message appears
7. ✅ All prebuild cards disappear
```

#### 2. Verify All Cleared
```
✅ Shows "No prebuilds found" message
✅ CPU icon displayed
✅ Clean slate ready for new prebuilds
```

---

## 🌐 Test 5: Verify Public Page (3 minutes)

### **After Creating Prebuilds:**

#### 1. Test Dedicated Prebuild Page
```
1. Open new tab: http://localhost:5173/prebuild
2. ✅ Should see "Pre-Built Gaming PCs" page
3. ✅ Should show published prebuilds only
4. ✅ Draft prebuilds should NOT appear
5. ✅ Prices should match what you entered
```

#### 2. Test Home Page Featured Section
```
1. Go to: http://localhost:5173
2. Scroll down to "Featured Prebuilds"
3. ✅ Should show published prebuilds
4. ✅ Should show correct prices
5. ✅ PC fallback images working
6. ✅ Can click to view details
```

#### 3. Test Products Page Exclusion
```
1. Go to: http://localhost:5173/products
2. ✅ Should NOT show any prebuilds
3. ✅ Only regular products (CPUs, GPUs, etc.)
4. ✅ "Prebuild" NOT in category dropdown
```

---

## 📊 Complete Test Scenario

### **Full CRUD Test (15 minutes):**

```
✅ 1. CREATE: Add 3 prebuilds with different prices
   - Gaming: Rs. 150,000
   - Office: Rs. 60,000
   - Workstation: Rs. 200,000 (draft)

✅ 2. UPDATE: Edit gaming prebuild
   - Change title
   - Update price to Rs. 175,000
   - Mark as featured

✅ 3. DELETE: Remove workstation prebuild
   - Confirm deletion
   - Verify it's gone

✅ 4. VIEW PUBLIC: Check prebuilds on website
   - /prebuild page shows published only
   - Home page shows featured
   - Products page excludes prebuilds

✅ 5. CLEAR ALL: Delete all remaining prebuilds
   - Confirm mass deletion
   - Verify clean state
```

---

## ✅ Expected Results

### **After All Tests:**

#### Admin Panel:
```
✅ Can create prebuilds with custom prices
✅ Can update any field including price
✅ Can delete individual prebuilds
✅ Can clear all prebuilds at once
✅ Success/error messages working
✅ Loading states working
✅ Auto-refresh after operations
```

#### Public Pages:
```
✅ /prebuild shows published prebuilds
✅ Home shows featured prebuilds
✅ Products page excludes prebuilds
✅ Correct prices displayed everywhere
✅ PC fallback images working
✅ Click navigation working
```

#### Backend:
```
✅ POST /api/admin/prebuilds - Create
✅ PUT /api/admin/prebuilds/:id - Update
✅ DELETE /api/admin/prebuilds/:id - Delete
✅ GET /api/prebuilds - List public
✅ Saves to MongoDB or JSON file
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Failed to delete"**
```
Solution: Backend server must be running
Check: http://localhost:10000
Fix: Restart backend with: node backend/index.cjs
```

### **Issue 2: Price not saving**
```
Solution: Make sure price field has a value
Check: Price input should show number (not empty)
Fix: Enter a valid number (e.g., 150000)
```

### **Issue 3: Prebuild not appearing on public page**
```
Solution: Make sure "Publish" checkbox is checked
Check: Status badge should be green "published"
Fix: Edit prebuild and check "Publish"
```

### **Issue 4: Modal not closing**
```
Solution: Make sure all required fields are filled
Check: Title and Price are required fields
Fix: Fill in all fields marked with *
```

---

## 📝 Test Data Examples

### **Gaming PC:**
```
Title: Gaming Beast 2024
Category: Gaming
Description: Ultimate gaming experience with RTX 4080 and i9 processor
Price: 250000
Performance: Ultra High Performance
Featured: Yes
Status: Published
```

### **Office PC:**
```
Title: Office Pro Workstation
Category: Office
Description: Perfect for productivity and multitasking
Price: 75000
Performance: Standard Performance
Featured: No
Status: Published
```

### **Budget PC:**
```
Title: Budget Gaming Starter
Category: Budget
Description: Entry-level gaming at an affordable price
Price: 85000
Performance: Good Performance
Featured: Yes
Status: Published
```

### **Draft PC:**
```
Title: Custom Build Test
Category: High-End
Description: Testing draft functionality
Price: 300000
Performance: Extreme Performance
Featured: No
Status: Draft
```

---

## 🎯 Success Criteria

### **All Tests Pass If:**

- ✅ Can create prebuilds with prices
- ✅ Can edit and update prices
- ✅ Can delete individual prebuilds
- ✅ Can clear all prebuilds
- ✅ Published prebuilds show on public pages
- ✅ Draft prebuilds don't show on public pages
- ✅ Prices display correctly everywhere
- ✅ No console errors
- ✅ Success messages appear
- ✅ Pages refresh automatically

---

## 🚀 Quick Start Testing

### **Fast 5-Minute Test:**

```bash
# 1. Create
- Add prebuild: "Test PC", Price: 100000, Publish: Yes

# 2. Verify
- Check card shows Rs. 100,000

# 3. Update
- Edit, change price to 120000
- Check card shows Rs. 120,000

# 4. Public
- Visit /prebuild
- See "Test PC" with Rs. 120,000

# 5. Delete
- Click trash icon
- Confirm deletion
- Verify gone
```

---

## 📞 Support

**If any test fails:**

1. Check browser console (F12) for errors
2. Check backend terminal for logs
3. Verify backend running on port 10000
4. Verify frontend running on port 5173
5. Try refreshing browser (Ctrl + F5)

---

## ✅ Current Status

**Features Working:**
- ✅ Manual price input (NEW!)
- ✅ Create with price
- ✅ Update price
- ✅ Delete prebuild
- ✅ Clear all prebuilds
- ✅ Publish/Draft status
- ✅ Featured flag
- ✅ Public visibility
- ✅ Backend endpoints

**Backend Running:** Port 10000  
**Frontend Running:** Port 5173  
**Database:** MongoDB + JSON fallback  

---

**Start testing now! Create your first prebuild with a custom price.** 🎉

**Last Updated:** November 5, 2025, 9:05 AM UTC-8
