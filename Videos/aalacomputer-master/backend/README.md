Simple backend for AalaComputer (demo)

This backend is intentionally minimal and file-based so you can run it without a database.

How it works
- Express server in `backend/index.js`.
- Simple JSON storage under `backend/data/*.json` using `backend/utils/storage.js`.
- JWT-based auth middleware in `backend/middleware.js`.
- Auth routes: `backend/auth.js`:
  - POST /api/v1/auth/register -> { accessToken, user }
  - POST /api/v1/auth/login -> { accessToken, user }
  - GET /api/v1/auth/google -> (simulated) redirects to `/api/v1/auth/google/callback` which sets localStorage via a tiny HTML page and closes the popup.
- Orders & cart: `backend/orders.js`:
  - GET /api/v1/cart -> returns demo cart data (file)
  - POST /api/v1/cart -> save cart file
  - POST /api/v1/orders -> protected, place an order (requires Authorization: Bearer <token>)
  - GET /api/v1/orders -> protected, get user's orders

Start (from project root)

# Run backend only
npm run backend:start

# Run backend in dev mode (nodemon)
npm run backend:dev

Environment variables
- JWT_SECRET: secret used to sign tokens (defaults to 'dev_secret')
- PORT: backend port (defaults to 3000)

Google OAuth (real flow)

To enable real Google OAuth, set the following environment variables in `backend/.env` or your environment:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (optional, defaults to `http://localhost:3000/api/v1/auth/google/callback`)

Example `.env` (for development):

```env
JWT_SECRET=supersecret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
PORT=3000
```

Notes

- The backend performs the OAuth code flow: redirects to Google's consent screen, exchanges the code for tokens, fetches user info, upserts a local user, and returns our JWT to the popup via postMessage.
- Ensure your Google OAuth credentials include the redirect URI configured above.

This is a demo and not production-ready. Replace file-storage with a real DB for production.

Notes
- This is a demo and not production-ready. Replace file-storage with a real DB for production.
- The Google OAuth here is simulated; integrate real OAuth when ready
