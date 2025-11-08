#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building for production...');

try {
  // Ensure we're in the project root
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Make sure you\'re in the project root.');
    process.exit(1);
  }

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🏗️ Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verify dist folder exists
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Build completed successfully!');
    console.log('📁 Dist folder created at:', distPath);
  } else {
    console.error('❌ Dist folder not found after build!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
