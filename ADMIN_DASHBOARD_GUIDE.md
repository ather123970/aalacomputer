# Admin Dashboard Guide

A complete guide to the rebuilt admin dashboard system.

## Overview

The admin dashboard is a fully responsive REST API-based system where only one admin user can access and manage products with full CRUD operations.

## Architecture

### Backend
- **Technology**: Node.js + Express + MongoDB
- **Location**: `backend/index.cjs`
- **Models**: `backend/models/` (Admin.js, Product.js)

### Frontend
- **Technology**: React + Vite + TailwindCSS
- **Location**: `src/pages/AdminDashboard.jsx`
- **UI**: Responsive design (mobile, tablet, desktop)

## Admin Credentials

**IMPORTANT**: Only ONE admin user is allowed to exist in the system.

- **Email**: `aalacomputerstore@gmail.com`
- **Password**: `karachi123`

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (running locally or Atlas cloud)

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority
ADMIN_EMAIL=aalacomputerstore@gmail.com
ADMIN_PASSWORD=karachi123
JWT_SECRET=your_strong_random_secret_key_here
```

### 3. Seed the Database

**CRITICAL**: This script removes ALL existing admin users and creates only one admin.

```bash
npm run seed
```

This will:
- Delete all existing admin users
- Create only the allowed admin (aalacomputerstore@gmail.com)
- Seed sample products with stock and sold counts

### 4. Start the Server

```bash
npm start
```

The backend will run on `http://localhost:10000`

### 5. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/admin/login` - Login and get token
  ```json
  {
    "email": "aalacomputerstore@gmail.com",
    "password": "karachi123"
  }
  ```

### Product Management
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Stats
- `GET /api/products/stats/summary` - Get product stats
  ```json
  {
    "total": 8,
    "top": [
      { "id": "p_workhorse", "title": "Workhorse", "sold": 42, "stock": 8, "price": 230000 }
    ]
  }
  ```

### Legacy Admin Endpoints (still supported)
- `GET /api/admin/products` - List products (legacy)
- `GET /api/admin/stats` - Get detailed stats (legacy)

## Product Model Fields

```javascript
{
  id: String,           // Unique identifier
  title: String,        // Product name
  name: String,         // Alias for title (backward compatibility)
  price: Number,        // Product price
  stock: Number,        // Available quantity
  sold: Number,         // Total sold count
  imageUrl: String,     // Product image URL
  img: String,          // Alias for imageUrl (backward compatibility)
  description: String,  // Product description
  category: String,     // Product category
  tags: [String],       // Product tags
  specs: [String],      // Product specifications
  createdAt: Date,      // Creation timestamp
  updatedAt: Date        // Update timestamp
}
```

## Dashboard Features

### Stats Cards
1. **Total Products** - Shows total product count
2. **Low Stock Alert** - Products with stock < 5
3. **Top Sellers** - Products with highest sold counts

### Product Management
- **Responsive Table** - Shows all products with:
  - Product image and name
  - Category (hidden on mobile)
  - Price
  - Stock (red badge if < 5, hidden on mobile/tablet)
  - Sold count (hidden on mobile/tablet)
  - Actions (Edit, Delete)
- **Search & Filter** - Search by name/id, filter by category
- **Add Product** - Floating button opens create modal
- **Edit Product** - Click edit icon to modify
- **Delete Product** - Click delete icon with confirmation

### Form Validation
- Title required
- Price must be > 0
- Stock must be >= 0
- Sold must be >= 0
- Category required
- Image URL optional but validated if provided

### Responsive Design
- **Mobile (< 640px)**: Stacked layout, condensed columns
- **Tablet (641-1024px)**: Medium layout, some columns hidden
- **Desktop (>1024px)**: Full table with all columns

## Authentication Flow

1. User logs in via `/admin/login`
2. Backend validates credentials (bcrypt hash comparison)
3. Returns JWT token (expires in 7 days)
4. Frontend stores token in localStorage (`aalacomp_admin_token`)
5. All subsequent API calls include token in Authorization header
6. If token is invalid/missing, user is redirected to login

## Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT tokens with expiry (7 days)
- ✅ All product routes protected with token verification
- ✅ Single admin user enforced (all other admins deleted on seed)
- ✅ Environment variables for secrets
- ✅ No hardcoded credentials
- ✅ Request validation (product fields)

## Development Workflow

### Local Testing Checklist
1. ✅ MongoDB running locally
2. ✅ Environment variables set in `.env`
3. ✅ Run `npm run seed` to reset admin/users
4. ✅ Start backend: `npm start`
5. ✅ Start frontend: `npm run dev`
6. ✅ Login with aalacomputerstore@gmail.com / karachi123
7. ✅ Test CRUD operations
8. ✅ Test stats display
9. ✅ Test responsive layout (mobile, tablet, desktop)
10. ✅ Verify validation (try empty title, negative price)

## Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check MONGO_URI in `.env`
- Try connecting with MongoDB Compass to verify connection string

### "unauthorized" error
- Token expired or invalid
- Log out and log back in
- Check server logs for token verification errors

### "Product not found"
- Product ID doesn't exist
- Check if product was deleted
- Verify product ID in database

### Stats not showing
- Ensure products have `sold` field populated
- Run seed script to add sample data
- Check `/api/products/stats/summary` endpoint response

## Production Deployment

### Environment Variables (Production)
```env
MONGO_URI=your_production_mongodb_uri
ADMIN_EMAIL=aalacomputerstore@gmail.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_strong_random_secret
PORT=10000
NODE_ENV=production
```

### Build & Deploy
```bash
npm run build  # Build frontend
npm start      # Start production server
```

### Security Checklist
- ✅ Use HTTPS in production
- ✅ Set strong JWT_SECRET
- ✅ Use strong admin password
- ✅ Enable rate limiting on auth endpoints
- ✅ Log auth attempts
- ✅ Use managed MongoDB (Atlas recommended)

## File Structure

```
backend/
├── index.cjs              # Main server file
├── seed.js                 # Seed script (runs on startup)
├── models/
│   ├── Admin.js           # Admin model
│   └── Product.js         # Product model
└── data/
    └── products.json      # Fallback product data

src/
├── pages/
│   ├── AdminLogin.jsx     # Login page
│   └── AdminDashboard.jsx # Dashboard (main UI)
└── config/
    └── api.js              # API configuration
```

## Testing the System

### Quick Test Script
```bash
# 1. Start MongoDB
mongod

# 2. Seed database
npm run seed

# 3. Start backend
npm start

# 4. Start frontend (new terminal)
npm run dev

# 5. Login at http://localhost:5173/admin/login
# Email: aalacomputerstore@gmail.com
# Password: karachi123

# 6. Test operations:
# - View products list
# - Create new product
# - Edit existing product
# - Delete product
# - Check stats
# - Test responsive design
```

## Support

For issues or questions:
- Check server logs: `console.log` outputs in terminal
- Check browser console: F12 → Console tab
- Verify environment variables
- Ensure MongoDB is connected
- Run seed script again to reset

## License

MIT - See LICENSE file for details

