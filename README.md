# Aala Computer - E-commerce Platform

A full-stack e-commerce application for PC parts and accessories, built with React, Vite, Express.js, and MongoDB.

## 🚀 Features

### Frontend
- **Modern React 19** with hooks and suspense
- **Vite** for fast development and building
- **Tailwind CSS 4** for responsive design
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Express.js** REST API
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for admin access
- **CORS** enabled for cross-origin requests
- **Compression** for performance
- **Helmet** for security

### Admin Dashboard
- **Product Management** - Full CRUD operations
- **Image Upload** - Local and external image support
- **Deals Creation** - Create product combos with discounts
- **Analytics** - Sales and product insights
- **Category/Brand Management** - Organize inventory
- **Bulk Operations** - Mass edit and update

### User Features
- **Product Catalog** - Browse with pagination
- **Search & Filter** - Find products easily
- **Shopping Cart** - Add to cart functionality
- **Checkout** - Complete order process
- **WhatsApp Integration** - Order notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/ather123970/aalacomputer.git
cd aalacomputer
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: MONGO_URI, JWT_SECRET
# Optional: PORT, FRONTEND_ORIGIN, etc.
```

4. **Start Development**
```bash
# Start frontend (Vite dev server)
npm run dev

# Start backend (Express server)
npm run backend

# Or start both concurrently
npm run dev & npm run backend
```

## 🌐 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

#### Required
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens

#### Optional
- `PORT` - Backend port (default: 10000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_ORIGIN` - Allowed frontend origins
- `VITE_BACKEND_URL` - Backend URL for frontend

### Platform-Specific Deployment

#### Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Render
1. Connect repository to Render
2. Use `render.yaml` configuration
3. Set environment variables
4. Deploy automatically

#### Docker
```bash
# Build image
docker build -t aalacomputer .

# Run container
docker run -p 3000:3000 aalacomputer
```

## 📁 Project Structure

```
aalacomputer/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── config/            # Configuration
│   ├── utils/             # Utility functions
│   └── styles/            # CSS/Tailwind
├── backend/                # Backend source
│   ├── routes/            # API routes
│   ├── models/            # MongoDB models
│   ├── middleware/        # Express middleware
│   └── data/              # JSON data storage
├── api/                   # Serverless API (Vercel)
├── public/                # Static assets
├── dist/                  # Build output
└── docs/                  # Documentation
```

## 🔧 Configuration

### API Endpoints

#### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Categories & Brands
- `GET /api/categories` - Get all categories
- `GET /api/brands` - Get all brands
- `POST /api/categories` - Create category (admin)
- `POST /api/brands` - Create brand (admin)

#### Deals
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create deal (admin)
- `DELETE /api/deals/:id` - Delete deal (admin)

#### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard stats

### Frontend Routes

#### Public
- `/` - Home page
- `/products` - Product catalog
- `/products/:id` - Product detail
- `/categories` - Categories page
- `/brands` - Brands page
- `/cart` - Shopping cart
- `/checkout` - Checkout process

#### Admin
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard

## 🎯 Key Features

### Multi-Domain Support
The application automatically detects the domain and adjusts API calls:
- **Development**: `http://localhost:10000`
- **Production**: Uses current domain (works on any domain)
- **Override**: Set `VITE_BACKEND_URL` environment variable

### Image Handling
- **Local Upload**: Drag & drop or file selection
- **External URLs**: Paste image links
- **Auto Preview**: Live image preview
- **Fallback**: Placeholder for broken images

### Performance Optimizations
- **Lazy Loading**: Components and images
- **Pagination**: 32 products per page
- **Compression**: Gzip compression enabled
- **Caching**: Browser and server caching
- **Code Splitting**: Automatic with Vite

### Security
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers
- **JWT**: Secure admin authentication
- **Rate Limiting**: API protection
- **Input Validation**: Data sanitization

## 🛠️ Development

### Scripts
```bash
# Development
npm run dev              # Start Vite dev server
npm run backend          # Start Express backend
npm run server           # Start with nodemon

# Building
npm run build            # Production build
npm run build:prod       # Production mode build
npm run preview          # Preview build

# Database
npm run seed             # Seed database
npm run import-products  # Import products
npm run update-prices    # Update product prices

# Testing
npm run test-backend     # Test backend API
npm run verify-products  # Verify product data
```

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit checks
- **TypeScript**: Optional type checking

## 📊 Analytics & Monitoring

### Admin Dashboard Features
- **Product Count**: Total products in database
- **Total Valuation**: Sum of all product prices
- **Top Sellers**: Best performing products
- **Category Distribution**: Products by category
- **Stock Management**: Low stock alerts

### Performance Metrics
- **Page Load**: Optimized for fast loading
- **API Response**: Sub-second response times
- **Image Loading**: Progressive image loading
- **Search**: Instant search with debouncing

## 🚀 Production Checklist

### Before Deployment
- [ ] Set `NODE_ENV=production`
- [ ] Configure `MONGO_URI`
- [ ] Set strong `JWT_SECRET`
- [ ] Update `FRONTEND_ORIGIN`
- [ ] Test all API endpoints
- [ ] Verify image loading
- [ ] Test admin login
- [ ] Check checkout process

### After Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify SSL certificates
- [ ] Test domain URLs
- [ ] Check mobile responsiveness
- [ ] Validate payment flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🔄 Updates

The application is actively maintained with:
- Regular security updates
- Performance improvements
- New features based on feedback
- Bug fixes and patches

---

**Built with ❤️ for Aala Computer**
