#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building frontend...');

try {
  // Check if we're in the right directory
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Make sure you\'re in the project root.');
    process.exit(1);
  }

  // Run vite build
  console.log('📦 Running vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  
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
        // List files in subdirectories
        const subFiles = fs.readdirSync(filePath);
        subFiles.forEach(subFile => {
          console.log(`      📄 ${subFile}`);
        });
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
  console.error('Full error:', error);
  process.exit(1);
}
