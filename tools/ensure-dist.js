const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distIndex = path.join(__dirname, '..', 'backend', 'dist', 'index.html');

if (fs.existsSync(distIndex)) {
  console.log('Found backend/dist/index.html — skipping Vite build.');
  process.exit(0);
}

console.log('backend/dist/index.html not found — running Vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  process.exit(0);
} catch (err) {
  console.error('Vite build failed:', err);
  process.exit(err.status || 1);
}
