# Production-Ready CRUD Admin Dashboard Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/Aalacomputer
# or for production MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Aalacomputer

ADMIN_EMAIL=aalacomputerstore@gmail.com
ADMIN_PASSWORD=karachi123
JWT_SECRET=your_strong_random_secret_key_here
PORT=10000
NODE_ENV=development
```

### 3. Seed the Database
```bash
npm run seed
```

This will:
- ✅ Delete ALL existing admins (only one admin allowed)
- ✅ Create admin user (aalacomputerstore@gmail.com)
- ✅ Seed 8 sample products with real data
- ✅ Connect to MongoDB

### 4. Start the Backend
```bash
npm start
```

Backend runs on `http://localhost:10000`

### 5. Start the Frontend (in another terminal)
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Testing the Complete CRUD System

### Test Flow:

1. **Login to Admin Dashboard**
   - Go to: `http://localhost:5173/admin/login`
   - Email: `aalacomputerstore@gmail.com`
   - Password: `karachi123`

2. **View Products in Admin Dashboard**
   - Should see 8 seeded products
   - Each with: name, price, stock, sold, category

3. **Create a New Product in Admin**
   - Click "Add Product"
   - Fill in: Title, Price, Stock, Category, Image URL
   - Click "Create Product"
   - **Product appears in admin table immediately**

4. **Check Products Page**
   - Go to: `http://localhost:5173/products`
   - **THE NEW PRODUCT SHOULD BE VISIBLE HERE!**
   - Same data from same database

5. **Edit Product in Admin**
   - Click edit icon in admin dashboard
   - Change price or name
   - Click "Update Product"
   - **Changes appear on products page**

6. **Delete Product in Admin**
   - Click delete icon in admin dashboard
   - Confirm deletion
   - **Product removed from products page**

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/products` - Get all products (for frontend)
- `GET /api/ping` - Health check

### Protected Endpoints (Requires JWT Token)
- `POST /api/admin/login` - Login and get token
- `GET /api/admin/products` - Get all products (admin view)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/products/stats/summary` - Get product stats
- `GET /api/admin/stats` - Get detailed admin stats

## Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│  Admin Dashboard│────────▶│  Backend API │────────▶│   MongoDB    │
│  (React Admin)  │         │  (Express)   │         │  (Database)  │
└─────────────────┘         └──────────────┘         └──────────────┘
         │                           │                         ▲
         │                           │                         │
         │                           ▼                         │
         │                  ┌──────────────┐                   │
         └─────────────────▶│ Products Page│                   │
                            │   (Public)   │───────────────────┘
                            └──────────────┘

✅ Both Admin Dashboard and Products Page use THE SAME DATABASE
✅ Changes in admin immediately reflect on products page
✅ Real CRUD operations across both views
```

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Aalacomputer
ADMIN_EMAIL=aalacomputerstore@gmail.com
ADMIN_PASSWORD=your_secure_password_here
JWT_SECRET=your_strong_random_secret_minimum_32_characters
PORT=10000
FRONTEND_ORIGINS=https://yourdomain.com
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Security Checklist

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT tokens with expiry (7 days)
- ✅ All admin routes protected with token verification
- ✅ Single admin user enforced
- ✅ Environment variables for secrets
- ✅ No hardcoded credentials
- ✅ Request validation
- ✅ Error handling
- ✅ CORS configured

## Troubleshooting

### Seed Script Not Working

```bash
# Check if MongoDB is running
mongosh

# Manual seed (if npm run seed fails)
node backend/seed.js
```

### Products Not Showing

1. Check backend is running: `npm start`
2. Check database: `mongosh` → `use Aalacomputer` → `db.products.find()`
3. Check API: `curl http://localhost:10000/api/products`
4. Run seed again: `npm run seed`

### Admin Dashboard Blank

1. Check browser console (F12) for errors
2. Verify token exists: `localStorage.getItem('aalacomp_admin_token')`
3. Try logging in again at `/admin/login`

### Products Page Blank

1. Check network tab (F12 → Network)
2. Look for `GET /api/products` - should return 200 OK
3. Verify backend is running on port 10000
4. Check MongoDB has products

## Data Model

### Product Schema
```javascript
{
  id: String,           // Unique ID
  name: String,         // Product name (legacy)
  title: String,       // Product title
  price: Number,        // Price in PKR
  img: String,         // Image path (legacy)
  imageUrl: String,    // Image URL
  description: String, // Product description
  category: String,    // Product category
  tags: [String],      // Product tags
  specs: [String],     // Product specs
  stock: Number,       // Available quantity
  sold: Number,        // Units sold
  createdAt: Date,     // Creation date
  updatedAt: Date         // Update date
}
```

### Admin Schema
```javascript
{
  email: String,           // Admin email
  passwordHash: String,    // Bcrypt hash
  name: String,           // Admin name
  role: String,           // User role (admin)
  createdAt: Date,
  updatedAt: Date
}
```

## Success Indicators

✅ Seed script runs without errors
✅ Backend starts on port 10000
✅ Frontend runs on port 5173
✅ Can login to admin dashboard
✅ Can see products in admin dashboard
✅ Can create/edit/delete products
✅ Products appear on products page
✅ Changes persist in database

## Support

For issues:
1. Check server logs
2. Check browser console
3. Verify `.env` file exists
4. Run `npm run seed` again
5. Check MongoDB connection



