const fs = require('fs');
const path = require('path');

console.log('🔄 Generating products cache...');

// Try to find products from existing files
const possiblePaths = [
  path.join(__dirname, '../data/products.json'),
  path.join(__dirname, '../products.json'),
  path.join(process.env.HOME || process.env.USERPROFILE, 'OneDrive/Documents/aalacomputer.products.json'),
  path.join(process.env.HOME || process.env.USERPROFILE, 'OneDrive/Pictures/aalacomputer.products.json'),
];

let products = [];

for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    try {
      console.log(`📂 Found products file: ${filePath}`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (Array.isArray(data)) {
        products = data;
      } else if (data && data.products && Array.isArray(data.products)) {
        products = data.products;
      }
      
      if (products.length > 0) {
        console.log(`✅ Loaded ${products.length} products`);
        break;
      }
    } catch (err) {
      console.error(`❌ Error reading ${filePath}:`, err.message);
    }
  }
}

if (products.length === 0) {
  console.log('⚠️  No products found. Creating dummy data for testing...');
  products = Array.from({ length: 5500 }, (_, i) => ({
    _id: `dummy_${i}`,
    name: `Product ${i + 1}`,
    title: `Test Product ${i + 1}`,
    price: Math.floor(Math.random() * 100000) + 1000,
    category: ['CPU Coolers', 'Monitors', 'Mouse', 'Keyboards', 'Laptops', 'Graphics Cards', 'Power Supplies', 'PC Cases', 'RAM', 'Motherboards', 'Headsets', 'Processors', 'Storage'][Math.floor(Math.random() * 13)],
    brand: ['ASUS', 'MSI', 'Corsair', 'Kingston', 'Samsung', 'Intel', 'AMD'][Math.floor(Math.random() * 7)],
    description: `Test product description ${i + 1}`,
    imageUrl: `https://via.placeholder.com/300?text=Product+${i + 1}`
  }));
}

// Save to cache file
const cacheFile = path.join(__dirname, 'products-cache.json');
const cacheData = { products, timestamp: new Date().toISOString() };

fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));

console.log(`✅ Cache generated: ${cacheFile}`);
console.log(`📊 Total products in cache: ${products.length}`);
console.log(`💾 Cache file size: ${(fs.statSync(cacheFile).size / 1024 / 1024).toFixed(2)} MB`);
