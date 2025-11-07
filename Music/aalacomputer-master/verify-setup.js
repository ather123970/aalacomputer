const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Setup...\n');

// Check JSON file
const jsonFile = 'aalacomputer.final.json';
if (!fs.existsSync(jsonFile)) {
  console.log('❌ JSON file not found:', jsonFile);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
console.log('✅ JSON file found');
console.log(`   Products: ${data.length}`);

// Check image format
let correctFormat = 0;
let incorrectFormat = 0;

for (const product of data) {
  if (product.img && product.img.startsWith('/images/')) {
    correctFormat++;
  } else if (product.img) {
    incorrectFormat++;
  }
}

console.log(`   Correct format (/images/...): ${correctFormat}`);
console.log(`   Incorrect format: ${incorrectFormat}`);

if (incorrectFormat > 0) {
  console.log('⚠️  Some images have incorrect format!');
} else {
  console.log('✅ All images have correct format');
}

// Check zah_images folder
const zahImagesPath = path.join(__dirname, 'zah_images');
if (!fs.existsSync(zahImagesPath)) {
  console.log('❌ zah_images folder not found');
  process.exit(1);
}

const imageFiles = fs.readdirSync(zahImagesPath).filter(f => 
  /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
);

console.log('\n✅ zah_images folder found');
console.log(`   Image files: ${imageFiles.length}`);

// Sample verification
console.log('\n📋 Sample Products:');
for (let i = 0; i < Math.min(3, data.length); i++) {
  const product = data[i];
  console.log(`\n${i + 1}. ${product.name}`);
  console.log(`   Price: Rs. ${product.price?.toLocaleString()}`);
  console.log(`   Image: ${product.img}`);
  
  // Check if image file exists
  const imageName = product.img?.replace('/images/', '');
  if (imageName && fs.existsSync(path.join(zahImagesPath, imageName))) {
    console.log(`   ✅ Image file exists`);
  } else if (imageName) {
    console.log(`   ⚠️  Image file not found: ${imageName}`);
  }
}

// Check backend
const backendFile = path.join(__dirname, 'backend', 'index.cjs');
if (fs.existsSync(backendFile)) {
  const backendCode = fs.readFileSync(backendFile, 'utf8');
  if (backendCode.includes('zah_images')) {
    console.log('\n✅ Backend configured to serve zah_images');
  } else {
    console.log('\n⚠️  Backend may not be configured for zah_images');
  }
} else {
  console.log('\n⚠️  Backend file not found');
}

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total Products: ${data.length}`);
console.log(`Image Files: ${imageFiles.length}`);
console.log(`Correct Format: ${correctFormat}/${data.length}`);
console.log('='.repeat(60));

if (incorrectFormat === 0 && imageFiles.length > 0) {
  console.log('\n🎉 Everything looks good!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Import to MongoDB:');
  console.log('      mongoimport --db aalacomputer --collection products --file aalacomputer.final.json --jsonArray');
  console.log('\n   2. Start your backend:');
  console.log('      npm run server');
  console.log('\n   3. Test image access:');
  console.log('      http://localhost:3000/images/test.jpg');
} else {
  console.log('\n⚠️  Please fix the issues above before importing to MongoDB');
}
