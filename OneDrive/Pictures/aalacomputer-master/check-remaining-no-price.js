const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkRemainingProducts() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
  });

  try {
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db('aalacomputer');
    const productsCollection = db.collection('products');

    // Count total products
    const totalCount = await productsCollection.countDocuments();
    console.log(`📊 Total products in database: ${totalCount}`);

    // Count products without prices
    const noPriceCount = await productsCollection.countDocuments({
      $or: [
        { price: 0 },
        { price: null },
        { price: { $exists: false } }
      ]
    });
    
    console.log(`⚠️  Products without prices: ${noPriceCount}\n`);

    if (noPriceCount === 0) {
      console.log('✅ All products have prices!');
      return;
    }

    // Fetch products without prices
    console.log('🔍 Fetching products without prices...\n');
    const productsNeedingPrices = await productsCollection
      .find({
        $or: [
          { price: 0 },
          { price: null },
          { price: { $exists: false } }
        ]
      })
      .project({ 
        _id: 1, 
        Name: 1, 
        name: 1, 
        title: 1, 
        category: 1, 
        brand: 1,
        price: 1 
      })
      .toArray();

    console.log('='.repeat(80));
    console.log('PRODUCTS NEEDING PRICES');
    console.log('='.repeat(80) + '\n');

    const output = [];
    
    productsNeedingPrices.forEach((product, index) => {
      const productName = product.Name || product.name || product.title || 'Unnamed Product';
      const brand = product.brand || 'No Brand';
      const category = product.category || 'No Category';
      
      const info = {
        index: index + 1,
        id: product._id.toString(),
        name: productName,
        brand: brand,
        category: category
      };
      
      console.log(`${index + 1}. ${productName}`);
      console.log(`   Brand: ${brand} | Category: ${category}`);
      console.log('-'.repeat(80));
      
      output.push(info);
    });

    // Save to JSON file for online price search
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'products-needing-prices.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    
    console.log(`\n📄 List saved to: ${outputPath}`);
    console.log(`\n📊 Summary: ${noPriceCount} products need prices`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Database connection closed');
  }
}

checkRemainingProducts();
