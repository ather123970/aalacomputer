# MongoDB and Environment Setup

To ensure proper functionality in both local development and production environments, the following environment variables must be configured:

## Required Environment Variables

1. `MONGO_URI` (Required for database connection)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Must be set in production (Render dashboard)
   - For local development, can be set in `.env` file

2. `FRONTEND_ORIGIN` (Required for image URLs)
   - Format: `https://yourdomain.com` (no trailing slash)
   - Used to generate absolute URLs for images
   - Must match your frontend domain

3. `API_BASE_URL` (Optional, falls back to FRONTEND_ORIGIN)
   - Format: `https://api.yourdomain.com` (no trailing slash)
   - Use if your API is hosted on a different domain

## Verifying MongoDB Connection

To verify your MongoDB connection:

1. Check the server logs for connection status
2. Look for messages like "MongoDB connected successfully"
3. If you see connection errors, verify your MONGO_URI is correct

## Common Issues

1. Image URLs not updating:
   - Ensure FRONTEND_ORIGIN is set correctly
   - Check MongoDB connection status
   - Verify admin authentication token is valid

2. Database connection issues:
   - Verify MONGO_URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure cluster is running and accessible

3. Authorization issues:
   - Verify admin token is being sent in requests
   - Check JWT_SECRET matches between environments

## Local Development

Create a `.env` file in the root directory with:

```env
MONGO_URI=your_mongodb_connection_string
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=your_secret_key
```

## Production Deployment

In your Render dashboard:

1. Go to your service
2. Navigate to Environment
3. Add the required environment variables
4. Ensure MONGO_URI and JWT_SECRET are secured
5. Deploy to apply changes

After updating environment variables, always redeploy your application to ensure changes take effect.