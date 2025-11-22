# App Testing Guide ✅

## Servers Status

✅ **Backend Server**
- URL: http://localhost:10000
- Status: RUNNING
- Port: 10000
- Database: Connected

✅ **Frontend Server**
- URL: http://localhost:5173
- Status: RUNNING
- Port: 5173
- Vite: Ready

## Testing Instructions

### 1. Home Page
**URL:** http://localhost:5173
- Check: Hero section displays
- Check: Navigation works
- Check: Featured products show
- Check: Images load

### 2. Products Page
**URL:** http://localhost:5173/products
- Check: All products display with images
- Check: Category filter works
- Check: Brand filter works
- Check: Search functionality works
- Check: Pagination works
- Check: Product cards show images correctly

### 3. Category Pages
**Test these categories:**
- Graphics Cards: http://localhost:5173/categories/graphics-cards
- Processors: http://localhost:5173/categories/processors
- RAM: http://localhost:5173/categories/ram
- Storage: http://localhost:5173/categories/storage
- Monitors: http://localhost:5173/categories/monitors
- Laptops: http://localhost:5173/categories/laptops

**Check for each:**
- ✅ Products load with images
- ✅ Category name displays correctly
- ✅ Product count shows
- ✅ Pagination works
- ✅ Images are from database

### 4. Admin Dashboard
**URL:** http://localhost:5173/admin
- Check: Login page displays
- Check: Admin credentials work
- Check: Products display in admin
- Check: Images show in admin
- Check: Can edit products
- Check: Can upload images

### 5. Image Loading Tests

#### Test External URLs
- Open browser DevTools (F12)
- Go to Console tab
- Navigate to products page
- Look for image loading logs
- Verify images load without errors

#### Test Different Image Types
- External URLs (https://...)
- Local paths (/images/...)
- Base64 images (data:image/...)

#### Check Console for Errors
- Should NOT see SmartImage errors
- Should see SimpleImage loading
- Should NOT see proxy errors
- Should NOT see timeout errors

### 6. Performance Tests

#### Page Load Time
- Products page: Should load in < 3 seconds
- Category pages: Should load in < 3 seconds
- Admin dashboard: Should load in < 2 seconds

#### Image Load Time
- Database images: Should load in < 5 seconds
- Fallback images: Should load instantly

### 7. Responsive Design Tests

#### Mobile (375px width)
- Navigate to products page
- Check: Layout adapts
- Check: Images display
- Check: Navigation works
- Check: Filters work

#### Tablet (768px width)
- Check: 2-column layout
- Check: Images display
- Check: Navigation works

#### Desktop (1920px width)
- Check: 4-column layout
- Check: Images display
- Check: All features work

## Quick Test Checklist

### Images
- [ ] Admin dashboard shows product images
- [ ] Products page shows product images
- [ ] Category pages show product images
- [ ] All images load without errors
- [ ] Fallback images show for missing images
- [ ] No SmartImage errors in console
- [ ] No timeout errors in console

### Functionality
- [ ] Category filter works
- [ ] Brand filter works
- [ ] Search works
- [ ] Pagination works
- [ ] Product details page works
- [ ] Add to cart works
- [ ] Checkout works

### Performance
- [ ] Pages load quickly
- [ ] Images load quickly
- [ ] No console errors
- [ ] No network errors
- [ ] Smooth scrolling
- [ ] Responsive design works

## Browser Console Checks

### Good Signs ✅
```
[Products] Loaded categories from database
[Products] Got 5035 products
[Products] Formatted 5035 products
SimpleImage Loading image: https://...
```

### Bad Signs ❌
```
SmartImage.jsx:44 [SmartImage] Loading image
SmartImage.jsx:122 [SmartImage] ❌ Image failed to load
[vite] http proxy error
ECONNREFUSED
Failed to load resource: 500
```

## Testing URLs

### Main Pages
- Home: http://localhost:5173/
- Products: http://localhost:5173/products
- Admin: http://localhost:5173/admin
- Cart: http://localhost:5173/cart
- Checkout: http://localhost:5173/checkout

### Category Pages
- Graphics Cards: http://localhost:5173/categories/graphics-cards
- Processors: http://localhost:5173/categories/processors
- Motherboards: http://localhost:5173/categories/motherboards
- RAM: http://localhost:5173/categories/ram
- Storage: http://localhost:5173/categories/storage
- Power Supplies: http://localhost:5173/categories/power-supplies
- CPU Coolers: http://localhost:5173/categories/cpu-coolers
- PC Cases: http://localhost:5173/categories/pc-cases
- Monitors: http://localhost:5173/categories/monitors
- Keyboards: http://localhost:5173/categories/keyboards
- Mouse: http://localhost:5173/categories/mouse
- Headsets: http://localhost:5173/categories/headsets
- Laptops: http://localhost:5173/categories/laptops

## Expected Results

### All Pages Should:
1. Load without errors
2. Display products with images
3. Show correct category/brand
4. Have working navigation
5. Be responsive on all devices
6. Have no console errors

### Images Should:
1. Load from database URLs
2. Display correctly
3. Not timeout
4. Show fallback if URL invalid
5. Be responsive (scale with container)

## Troubleshooting

### Images Not Showing
1. Hard refresh: `Ctrl+Shift+R`
2. Check browser console for errors
3. Verify backend is running
4. Check database has image URLs

### Page Not Loading
1. Check backend is running: `netstat -ano | findstr 10000`
2. Check frontend is running: `netstat -ano | findstr 5173`
3. Restart both servers
4. Clear browser cache

### Slow Loading
1. Check network tab in DevTools
2. Look for slow image URLs
3. Check backend response times
4. Verify database connection

## Status

✅ **Servers Running**
- Backend: http://localhost:10000
- Frontend: http://localhost:5173

✅ **Ready for Testing**
- All pages accessible
- Images configured
- Database connected
- No proxy errors

**Start testing now!**
