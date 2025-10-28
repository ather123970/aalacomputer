# Environment Variables Documentation

## Required Environment Variables for Render Deployment

Set these environment variables in your Render dashboard:

### Database
- `MONGO_URI` - MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/Aalacomputer`)

### JWT Secrets
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `ADMIN_JWT_SECRET` - Secret key for admin JWT tokens (use a different strong random string)

### Admin Credentials
- `ADMIN_EMAIL` - Admin email (default: `aalacomputeradmin@gmail.com`)
- `ADMIN_PASSWORD` - Admin password (default: `karachi123`)

### Frontend Configuration
- `FRONTEND_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://yourdomain.com,https://www.yourdomain.com`)

### Optional
- `PORT` - Server port (default: `10000`)
- `NODE_ENV` - Environment mode (`production` for Render)
- `WHATSAPP_NUMBER` - WhatsApp contact number (default: `+923125066195`)

### Google OAuth (if using Google login)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI

## Render Build Configuration

### Build Command
```
npm install && npm run build
```

### Start Command
```
npm start
```

### Environment
- Node Version: 18 or higher
- Environment: Production
