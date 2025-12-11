# Admin Login Credentials - Simplified

## ✅ UPDATED ADMIN LOGIN

The admin login has been **simplified** to only require a password.

### Current Admin Credentials:
- **Password:** `admin123`
- **Email Field:** Not required (you can leave any value or ignore it)

### How to Login:
1. Go to the admin page (usually `/admin` or `/admin/login`)
2. Enter any email (e.g., admin@aalacomputer.com) - **this field is ignored by the backend**
3. Enter password: `admin123`
4. Click login

**Note:** The frontend still shows an email field, but the backend only checks the password. You can enter any email address.

---

## 🚀 Running the Application

### Backend Server
- **Status:** ✅ Running
- **Port:** 10000
- **URL:** http://localhost:10000
- **API Endpoint:** http://localhost:10000/api/v1/auth/login
- **Command:** `powershell -ExecutionPolicy Bypass -File start-server.ps1`

### Frontend Server  
- **Status:** ✅ Running
- **Port:** 5174 (or 5173)
- **URL:** Check the terminal output for the exact URL (usually http://localhost:5173 or http://localhost:5174)
- **Command:** `npm run dev`

---

## 📝 Technical Details

### Backend Changes
**File:** `backend/auth.js` (Line 68-95)
- Removed email requirement from login endpoint
- Simplified to password-only authentication
- Password is checked directly: `admin123`
- Email field in request body is ignored

**File:** `backend/index.cjs` (Line 1322-1340)
- Also updated the `/api/admin/login` endpoint for consistency
- Both endpoints now accept just password

### How It Works:
When you submit the login form, the backend receives:
```json
{
  "email": "any@email.com",  // ← IGNORED
  "password": "admin123"     // ← CHECKED
}
```

The backend only validates the password field and ignores the email.

---

## 🔧 Commands

### Start Backend
```powershell
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

### Start Frontend
```bash
npm run dev
```

### Run Both
Open two terminal windows and run the above commands in each.

---

## 🎯 Testing the Login

1. ✅ Backend is running on port 10000
2. ✅ Frontend is running (check terminal for port)
3. ✅ Admin login simplified to just password "admin123"
4. Open your browser and go to the frontend URL
5. Navigate to admin login page (e.g., http://localhost:5173/admin)
6. Enter any email (or use: admin@aalacomputer.com)
7. Enter password: `admin123`
8. Click "Login to Dashboard"
9. You should be redirected to the admin dashboard

---

## ⚠️ Important Notes

- **The email field is still shown in the UI** but the backend ignores it
- Only the password `admin123` is checked
- If you want to remove the email field from the UI, you would need to update `src/pages/AdminLoginNew.jsx`
- The backend has been updated and is ready to accept password-only login
