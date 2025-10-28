# Render Deployment Guide

## Quick Setup for Render

### 1. Connect Repository
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository: `ather123970/aalacomputer`

### 2. Configure Service
- **Name**: `aalacomputer` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `master`

### 3. Build & Start Commands
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node backend/index.cjs`

### 4. Environment Variables
Add these in Render dashboard (Settings → Environment):

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

### 5. MongoDB Setup
**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string
4. Use as `MONGO_URI`

**Option B: Render MongoDB**
1. Create MongoDB service in Render
2. Use provided connection string

### 6. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy
- Your app will be available at `https://your-app-name.onrender.com`

## Troubleshooting

### "dist/ not found" Error
If you see this error:
1. Check that build command is: `npm install && npm run build`
2. Check that start command is: `node backend/index.cjs`
3. Ensure all dependencies are in `package.json`

### Build Fails
- Check Render logs for specific errors
- Ensure all required environment variables are set
- Verify MongoDB connection string is correct

### App Not Loading
- Check that `PORT` environment variable is set to `10000`
- Verify MongoDB is connected
- Check Render service logs

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Server port | Yes | `10000` |
| `MONGO_URI` | MongoDB connection | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/aalacomputer` |
| `ADMIN_EMAIL` | Admin login email | Yes | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin password | Yes | `secure_password_123` |
| `JWT_SECRET` | JWT signing key | Yes | `your_super_secret_jwt_key` |
| `FRONTEND_ORIGINS` | Allowed origins | No | `https://yourdomain.com,https://www.yourdomain.com` |

## Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records as instructed
5. Update `FRONTEND_ORIGINS` with your domain

## Monitoring

- **Logs**: View in Render dashboard
- **Metrics**: CPU, Memory, Response time
- **Health Check**: `/api/ping` endpoint

## Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test MongoDB connection
4. Check build logs for errors
