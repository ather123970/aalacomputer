// Minimal ESM shim: load the working CommonJS server implementation (index.cjs)
// This file keeps the repo runnable when package.json uses "type": "module".
try {
  // dynamic import will work in ESM environments; index.cjs runs the server.
  import('./index.cjs').catch((e) => {
    // if dynamic import fails (older Node), try createRequire fallback
    // eslint-disable-next-line no-console
    console.error('Failed to import ./index.cjs dynamically:', e && e.stack ? e.stack : e);
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Unable to start backend via index.cjs:', e && e.stack ? e.stack : e);
}
