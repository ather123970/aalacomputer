#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building frontend...');

try {
  // Run vite build
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if dist folder exists
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend built successfully!');
    console.log('📁 Dist folder contents:');
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`   📁 ${file}/`);
      } else {
        console.log(`   📄 ${file}`);
      }
    });
  } else {
    console.error('❌ Dist folder not found after build!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
