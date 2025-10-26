# RENDER DEPLOYMENT SETUP GUIDE

## Step 1: Environment Variables for Render
Copy these environment variables to your Render dashboard:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Aalacomputer
JWT_SECRET=2124377as
ADMIN_JWT_SECRET=2124377as
ADMIN_EMAIL=aalacomputeradmin@gmail.com
ADMIN_PASSWORD=karachi123
FRONTEND_ORIGINS=https://your-render-app.onrender.com,https://aalacomputer.com
WHATSAPP_NUMBER=+923125066195
PORT=10000
NODE_ENV=production
```

## Step 2: Render Service Configuration

### Build Command:
```
npm install && npm run build
```

### Start Command:
```
npm start
```

### Environment:
- **Node Version**: 18 or higher
- **Environment**: Production

## Step 3: MongoDB Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace `MONGO_URI` with your actual MongoDB connection string

## Step 4: Domain Configuration
1. Update `FRONTEND_ORIGINS` with your actual Render domain
2. Add your custom domain if you have one

## Step 5: Deploy
1. Connect your GitHub repository
2. Set all environment variables
3. Deploy!

## Admin Access
- **Email**: aalacomputeradmin@gmail.com
- **Password**: karachi123
- **Login URL**: https://your-app.onrender.com/admin

## Testing
After deployment, test these endpoints:
- `GET /api/ping` - Should return `{"ok": true}`
- `GET /` - Should serve your React app
- `POST /api/admin/login` - Admin login endpoint
