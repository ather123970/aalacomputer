# Troubleshooting Admin Dashboard Blank Page

If you're seeing a blank page at `/admin`, follow these steps:

## Quick Checks

### 1. Check Browser Console (F12)
Open Developer Tools → Console tab and look for:
- ❌ **Red errors** (network errors, CORS issues)
- ⚠️ **Yellow warnings**

Common errors:
- `Failed to fetch` → Backend not running
- `401 Unauthorized` → Token expired or invalid
- `CORS policy` → Backend CORS not configured

### 2. Check Backend is Running
```bash
# Terminal 1 - Should show: "Backend server listening on port 10000"
npm start
```

Test backend:
```bash
curl http://localhost:10000/api/ping
# Should return: {"ok":true,"ts":...}
```

### 3. Check Frontend is Running
```bash
# Terminal 2 - Should show: "Local: http://localhost:5173"
npm run dev
```

### 4. Verify Token Exists
Open Browser Console (F12) and type:
```javascript
localStorage.getItem('aalacomp_admin_token')
```
- If `null` → You need to log in
- If string → Token exists, check if it's valid

### 5. Login Flow
1. Go to: `http://localhost:5173/admin/login`
2. Use credentials:
   - Email: `aalacomputerstore@gmail.com`
   - Password: `karachi123`
3. Should redirect to `/admin` and show dashboard

### 6. Common Issues

#### Issue: "Loading dashboard..." forever
**Cause**: API calls failing
**Fix**:
- Check backend is running: `npm start`
- Check backend logs for errors
- Verify MongoDB is connected
- Check `.env` file has correct `MONGO_URI`

#### Issue: Redirects immediately to login
**Cause**: No token or token invalid
**Fix**:
- Clear localStorage:
  ```javascript
  localStorage.clear()
  ```
- Log in again at `/admin/login`

#### Issue: Shows blank white page
**Cause**: JavaScript error
**Fix**:
- Open browser console (F12)
- Check for React errors
- Look for import errors in terminal where `npm run dev` is running

#### Issue: "Failed to load data"
**Cause**: Backend API not responding
**Fix**:
- Ensure backend is running on port 10000
- Check `.env` has `MONGO_URI` set
- Verify MongoDB is running
- Run seed: `npm run seed`

## Step-by-Step Reset

### Complete Reset
```bash
# 1. Stop both servers (Ctrl+C)

# 2. Clear database (optional, will recreate on start)
# Remove MongoDB data or use: npm run seed

# 3. Start backend
npm start

# 4. In new terminal, start frontend
npm run dev

# 5. Open browser
# http://localhost:5173/admin/login
```

## Manual Token Check

If you want to manually verify the token works:

```javascript
// In browser console (F12)
const token = localStorage.getItem('aalacomp_admin_token');
console.log('Token exists:', !!token);

// Test API call
fetch('http://localhost:10000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Reload page
4. Look for:
   - `api/products` → Should return 200 OK
   - `api/products/stats/summary` → Should return 200 OK
   - If 401 → Token is invalid
   - If 500 → Backend error (check server logs)

## Database Check

Verify MongoDB connection:
```bash
# Check if MongoDB is running
mongosh

# Should connect successfully
# Then check database
use Aalacomputer
db.products.find()
```

## Environment Variables

Ensure `.env` file exists with:
```env
MONGO_URI=mongodb://127.0.0.1:27017/Aalacomputer
ADMIN_EMAIL=aalacomputerstore@gmail.com
ADMIN_PASSWORD=karachi123
JWT_SECRET=your_secret_key_here
PORT=10000
```

## Still Not Working?

### Debug Mode
Add this to see what's happening:

In browser console:
```javascript
// Check token
console.log('Token:', localStorage.getItem('aalacomp_admin_token'));

// Check API config
console.log('API Config:', window.location.origin);

// Manual API test
fetch('/api/products')
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));
```

### Check Component Rendering
Add to top of AdminDashboard:
```javascript
useEffect(() => {
  console.log('Dashboard mounted');
  console.log('Token exists:', !!localStorage.getItem('aalacomp_admin_token'));
}, []);
```

## Expected Behavior

When everything works:
1. ✅ Login page loads
2. ✅ Enter credentials
3. ✅ Redirects to `/admin`
4. ✅ Shows "Loading dashboard..."
5. ✅ Dashboard appears with stats and products

## Contact

If none of these work, check:
- Server logs in terminal running `npm start`
- Browser console for React errors
- Network tab for failed requests

