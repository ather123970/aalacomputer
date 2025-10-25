Production deployment notes
==========================

What this repo expects in production

- The built frontend is present at `backend/dist` (this repo currently contains the built bundle).
- The server entrypoint is `backend/index.cjs` (the `start` npm script runs this file).

Recommended production flow

1. Build on CI (preferred):
   - Checkout the repo, run `npm ci` and `npm run build` to produce `backend/dist` (Vite is configured to output into `backend/dist`).
   - Start the server: `npm start` (calls `node backend/index.cjs`).

2. If you prefer shipping the built bundle in Git (current state):
   - Ensure `backend/dist` is committed.
   - Deploy the repo; the `start` script will serve the committed build.

Health checks (smoke tests)

- GET / should return the SPA `index.html` (served from `backend/dist`).
- GET /api/ping should return JSON `{ ok: true, time: <timestamp> }`.

Process manager / containerization

- For robust production, run the server under a process manager (PM2) or inside Docker. Add monitoring and environment variables for configuration.
