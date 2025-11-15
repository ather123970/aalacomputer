/**
 * FIND PRODUCTS WITHOUT PRICES
 * Searches for products missing price information
 */

const mongoose = require('mongoose');

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
  brand: String,
  _id: mongoose.Schema.Types.ObjectId
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

async function findProductsWithoutPrices() {
  console.log('\n🔍 SEARCHING FOR PRODUCTS WITHOUT PRICES\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');
  
  // Find all products
  const allProducts = await Product.find({}).lean();
  console.log(`Total products in database: ${allProducts.length}\n`);
  
  const productsWithoutPrices = [];
  
  for (const product of allProducts) {
    const name = product.name || product.Name || product.title || 'Unnamed Product';
    
    // Check various price fields
    const price = product.price || product.Price || product.salePrice || product.regularPrice || 0;
    
    // If price is 0, null, undefined, or missing
    if (!price || price === 0 || price === '0') {
      productsWithoutPrices.push({
        name: name,
        category: product.category || 'No Category',
        brand: product.brand || 'No Brand',
        id: product._id
      });
    }
  }
  
  console.log('='.repeat(80));
  console.log(`📊 FOUND ${productsWithoutPrices.length} PRODUCTS WITHOUT PRICES`);
  console.log('='.repeat(80) + '\n');
  
  if (productsWithoutPrices.length > 0) {
    console.log('Products missing prices:\n');
    
    // Group by category for better readability
    const byCategory = {};
    
    for (const product of productsWithoutPrices) {
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      byCategory[product.category].push(product.name);
    }
    
    // Display by category
    for (const [category, names] of Object.entries(byCategory)) {
      console.log(`\n📁 ${category} (${names.length} products):`);
      console.log('─'.repeat(80));
      
      names.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📝 SUMMARY BY CATEGORY:\n');
    
    for (const [category, names] of Object.entries(byCategory)) {
      console.log(`  ${category}: ${names.length} products`);
    }
  } else {
    console.log('✅ All products have prices!\n');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 TOTAL: ${productsWithoutPrices.length} out of ${allProducts.length} products are missing prices\n`);
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

findProductsWithoutPrices();
