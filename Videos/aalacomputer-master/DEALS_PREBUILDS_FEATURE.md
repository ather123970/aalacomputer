# Deals & Prebuilds Feature Implementation

## ✅ What Was Implemented

### Frontend Changes (Admin Dashboard)
**File**: `src/pages/AdminDashboard.jsx`

Added two checkboxes to the product creation/edit form:
- **Deals Product** - When checked, saves the product to the Deals collection
- **Prebuild Product** - When checked, saves the product to the Prebuilds collection

#### How It Works:
1. Admin fills out the product form as usual
2. Optionally checks "Deals Product" and/or "Prebuild Product"
3. On submit:
   - Product is ALWAYS saved to the main Products collection
   - If "Deals Product" is checked → Also saved to Deals collection
   - If "Prebuild Product" is checked → Also saved to Prebuilds collection

### Backend Changes
**File**: `backend/index.cjs`

#### New MongoDB Collections:
- `deals` - Stores deal products
- `prebuilds` - Stores prebuild PC products

#### New API Endpoints:

**PUBLIC Endpoints** (No auth required):
- `GET /api/deals` - Fetch all deals
- `GET /api/prebuilds` - Fetch all prebuilds

**PROTECTED Endpoints** (Admin auth required):
- `POST /api/admin/deals` - Create a deal product
- `POST /api/admin/prebuilds` - Create a prebuild product

#### Data Structure:
All three collections (products, deals, prebuilds) use the same schema:
```json
{
  "id": "p_30026",
  "name": "Product Name",
  "title": "Product Title",
  "price": 24500,
  "img": "https://...",
  "imageUrl": "https://...",
  "description": "...",
  "category": "Category Name",
  "brand": "Brand Name",
  "specs": ["spec1", "spec2"],
  "tags": ["tag1", "tag2"],
  "stock": 35,
  "sold": 6,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### File Storage Fallback
Created placeholder files for fallback when MongoDB is unavailable:
- `data/deals.json`
- `data/prebuilds.json`

## 🎯 Usage Instructions

### For Admin:
1. Login to Admin Dashboard
2. Click "Add Product"
3. Fill in product details
4. Check the appropriate boxes:
   - ✅ **Deals Product** - To feature this in the Deals section
   - ✅ **Prebuild Product** - To show in Prebuilds section
   - Leave both unchecked for regular products only
5. Click "Create Product"

### For Frontend Developers:
To display deals or prebuilds on your pages:

**Deals.jsx** - Fetch deals:
```javascript
const response = await fetch('http://localhost:10000/api/deals');
const deals = await response.json();
```

**App.jsx (Prebuilds)** - Fetch prebuilds:
```javascript
const response = await fetch('http://localhost:10000/api/prebuilds');
const prebuilds = await response.json();
```

## 🔒 Database Configuration
Uses the existing MongoDB connection from `.env`:
```
MONGO_URI=mongodb+srv://...
```

Three separate collections are created automatically:
- `products` (existing)
- `deals` (new)
- `prebuilds` (new)

## ✨ Key Features
- ✅ Non-destructive - Existing product logic untouched
- ✅ Multi-collection save - One product can be in multiple places
- ✅ MongoDB-first with file fallback
- ✅ Same data structure across all collections
- ✅ Admin authentication required for writes
- ✅ Public read access for frontend pages

## 🧪 Testing
1. Start backend: `npm start`
2. Start frontend: `npm run dev`
3. Login to admin dashboard
4. Create a product with checkboxes checked
5. Verify in MongoDB:
   - Check `products` collection
   - Check `deals` collection (if checkbox was checked)
   - Check `prebuilds` collection (if checkbox was checked)
6. Test frontend fetch:
   - `GET http://localhost:10000/api/deals`
   - `GET http://localhost:10000/api/prebuilds`

## 📝 Notes
- Products are saved to the main collection first, then conditionally to deals/prebuilds
- If deals/prebuilds save fails, it won't block the main product creation
- Each collection maintains its own unique IDs (prefixed: `p_`, `d_`, `pb_`)
- All endpoints follow the same pattern as existing products endpoints
