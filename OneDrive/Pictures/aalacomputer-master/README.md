   # 🖥️ Aala Computer - E-Commerce Platform

> A modern, high-performance e-commerce platform for PC parts and accessories with smart filtering, urgency indicators, and optimized image loading.

## ✨ Features

### 🚀 Performance Optimized
- **Fast Image Loading**: Preloading + compression + caching
- **Gzip Compression**: 70% smaller response sizes
- **Lazy Loading**: Images load as you scroll
- **Code Splitting**: Optimized bundle sizes

### 🎯 Sales Boosting
- **Urgency Indicators**: "X viewing • Y bought • Z left" with fire icon
- **FOMO Psychology**: Creates urgency to purchase
- **Social Proof**: Shows real-time activity

### 🔍 Smart Filtering
- **Category Matching**: Fuzzy search in name and category
- **Brand Filtering**: Works across all products
- **Price Range**: Adjustable price filters
- **Search**: Full-text search across all fields

### 🎨 Modern UI/UX
- **Gradient Buttons**: Professional design
- **Hover Effects**: Smooth animations
- **Image Zoom**: Interactive product cards
- **Responsive**: Works on all devices

### 🌐 Domain-Agnostic
- Works on ANY domain automatically
- No configuration needed
- Supports custom backend URLs

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ather123970/aalacomputer.git
   cd aalacomputer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   MONGO_URI=mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority
   ADMIN_EMAIL=admin@aalacomputer.com
   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret
   PORT=10000
   NODE_ENV=development
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   npm run backend:start
   
   # Terminal 2: Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:10000
   - API: http://localhost:10000/api

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run backend:start` - Start Express server
- `npm run backend:dev` - Start with nodemon (auto-restart)

### Development Workflow

1. **Frontend Development**
   ```bash
   npm run dev
   ```
   - Frontend runs on http://localhost:5173
   - API calls are proxied to http://localhost:3000

2. **Backend Development**
   ```bash
   npm run backend:dev
   ```
   - Backend runs on http://localhost:3000
   - Auto-restarts on file changes

## 🚀 Deployment

### Option 1: Render (Recommended)

1. **Connect to GitHub**
   - Link your GitHub repository to Render
   - Set build command: `npm run build`
   - Set start command: `node backend/index.cjs`

2. **Environment Variables**
   Set these in Render dashboard:
   ```
   MONGO_URI=mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure_password
   JWT_SECRET=your_jwt_secret
   ```

3. **Deploy**
   - Render will automatically deploy on git push

### Option 2: Vercel

1. **Connect Repository**
   - Import project from GitHub to Vercel
   - Vercel will auto-detect the configuration

2. **Environment Variables**
   Set in Vercel dashboard:
   ```
   MONGO_URI=mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure_password
   JWT_SECRET=your_jwt_secret
   ```

### Option 3: Traditional VPS

1. **Server Setup**
   ```bash
   # Install Node.js and MongoDB
   sudo apt update
   sudo apt install nodejs npm mongodb
   
   # Clone and setup
   git clone https://github.com/ather123970/aalacomputer.git
   cd aalacomputer
   npm install
   npm run build
   ```

2. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start backend/index.cjs --name "aalacomputer"
   pm2 startup
   pm2 save
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port (default: 10000) | No |
| `FRONTEND_ORIGINS` | Allowed frontend origins | No |

### MongoDB Setup

1. **MongoDB Atlas (Cloud) - Recommended**
   - Create account at https://cloud.mongodb.com
   - Create cluster and get connection string
   - Use connection string as `MONGO_URI`

2. **Local MongoDB (Development Only)**
   ```bash
   # Install MongoDB
   # Start MongoDB service
   sudo systemctl start mongod
   ```

## 📱 Features Overview

### Customer Features
- Browse products and deals
- Add items to cart
- User authentication
- Order placement via WhatsApp
- Order tracking

### Admin Features
- Product management (CRUD)
- Order management
- Analytics dashboard
- User management

### Technical Features
- Responsive design
- PWA ready
- SEO optimized
- Fast loading with Vite
- Secure authentication

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@aalacomputer.com or create an issue in this repository.

## 🔗 Links

- **Live Demo**: [https://aalacomputer.com](https://aalacomputer.com)
- **GitHub Repository**: [https://github.com/ather123970/aalacomputer](https://github.com/ather123970/aalacomputer)
- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

Built with ❤️ for Aala Computer