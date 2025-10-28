export function withCors(req, res) {
  // Default origins include localhost dev hosts and known production hosts.
  const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'https://aalacomputerkarachi.vercel.app',
    'https://aalacomputer.com'
  ];

  const envVal = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '';
  const FRONTEND_ORIGINS = (envVal ? envVal.split(',') : DEFAULT_ORIGINS).map(s => (s || '').trim()).filter(Boolean);
  const ALLOW_ANY_ORIGIN = String(process.env.ALLOW_ANY_ORIGIN || '').toLowerCase() === 'true';

  const reqOrigin = req.headers && req.headers.origin;

  // Helper to set common CORS headers
  function setCommonHeaders(originValue) {
    if (originValue) {
      res.setHeader('Access-Control-Allow-Origin', originValue);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  // If explicitly allowed to accept any origin, echo origin (keeps credentials working)
  if (ALLOW_ANY_ORIGIN) {
    if (reqOrigin) {
      setCommonHeaders(reqOrigin);
    } else {
      setCommonHeaders('*');
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    return;
  }

  // If specific origins configured (and not wildcard), only allow matching origins
  if (FRONTEND_ORIGINS.length > 0 && FRONTEND_ORIGINS.indexOf('*') === -1) {
    if (reqOrigin) {
      if (FRONTEND_ORIGINS.indexOf(reqOrigin) !== -1) {
        setCommonHeaders(reqOrigin);
      } else {
        // Origin not allowed: set minimal headers for preflight and return 403 for OPTIONS,
        // otherwise do not set Access-Control-Allow-Origin so the browser will block the request.
        setCommonHeaders();
        if (req.method === 'OPTIONS') {
          return res.status(403).end();
        }
      }
    } else {
      // Non-browser request (no Origin header) - allow using first configured origin for responses
      setCommonHeaders(FRONTEND_ORIGINS[0]);
    }
  } else {
    // Allow any origin when wildcard configured or no explicit list provided
    setCommonHeaders(reqOrigin || '*');
  }

  // Respond to preflight immediately
  if (req.method === 'OPTIONS') return res.status(204).end();
}
