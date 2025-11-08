/**
 * SAVE PRODUCTS WITHOUT PRICES TO FILE
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String,
  Name: String,
  title: String,
  price: Number,
  Price: Number,
  salePrice: Number,
  regularPrice: Number,
  category: String,
  brand: String
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

async function saveProductsWithoutPrices() {
  await mongoose.connect(MONGODB_URI);
  
  const allProducts = await Product.find({}).lean();
  const productsWithoutPrices = [];
  
  for (const product of allProducts) {
    const name = product.name || product.Name || product.title || 'Unnamed Product';
    const price = product.price || product.Price || product.salePrice || product.regularPrice || 0;
    
    if (!price || price === 0 || price === '0') {
      productsWithoutPrices.push({
        name: name,
        category: product.category || 'No Category',
        brand: product.brand || 'No Brand'
      });
    }
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '..', '..', 'PRODUCTS_WITHOUT_PRICES.txt');
  
  let output = '';
  output += '========================================\n';
  output += `PRODUCTS WITHOUT PRICES (${productsWithoutPrices.length} total)\n`;
  output += '========================================\n\n';
  
  productsWithoutPrices.forEach((product, index) => {
    output += `${index + 1}. ${product.name}\n`;
    output += `   Category: ${product.category}\n`;
    output += `   Brand: ${product.brand}\n\n`;
  });
  
  output += '========================================\n';
  output += `Total: ${productsWithoutPrices.length} products\n`;
  output += '========================================\n';
  
  fs.writeFileSync(outputPath, output, 'utf8');
  
  console.log(`\n✅ Saved to: ${outputPath}`);
  console.log(`📊 Total products without prices: ${productsWithoutPrices.length}\n`);
  
  await mongoose.connection.close();
}

saveProductsWithoutPrices();
