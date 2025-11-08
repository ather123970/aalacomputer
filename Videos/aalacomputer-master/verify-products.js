/**
 * Verify Products in Database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyProducts() {
  try {
    console.log('🔍 Verifying Products in Database...\n');
    
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const productSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    const products = await Product.find({}).limit(10);
    
    console.log(`📦 Found ${products.length} products\n`);
    
    if (products.length > 0) {
      console.log('Sample Product:');
      console.log('=' .repeat(60));
      const sample = products[0];
      console.log(`Name: ${sample.name || sample.Name}`);
      console.log(`Category: ${sample.category}`);
      console.log(`Brand: ${sample.brand}`);
      console.log(`Price: PKR ${sample.price}`);
      console.log(`Image URL: ${sample.imageUrl || sample.img || 'MISSING'}`);
      console.log(`Has imageUrl: ${!!sample.imageUrl}`);
      console.log(`Has img: ${!!sample.img}`);
      console.log('=' .repeat(60));
      
      console.log('\n📊 Category Distribution:');
      const categoryCount = {};
      const allProducts = await Product.find({});
      allProducts.forEach(p => {
        const cat = p.category || 'No Category';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      
      Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} products`);
      });
      
      console.log(`\n✅ Total: ${allProducts.length} products in database`);
    } else {
      console.log('❌ No products found in database!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected');
    process.exit(0);
  }
}

verifyProducts();
