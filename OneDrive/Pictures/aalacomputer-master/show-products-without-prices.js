const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function showProductsWithoutPrices() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
  });

  try {
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('aalacomputer');
    const productsCollection = db.collection('products');

    console.log('🔍 Fetching products without prices...\n');
    
    const productsWithoutPrice = await productsCollection
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
      .limit(100) // Limit to first 100 for readability
      .toArray();

    console.log(`Found ${productsWithoutPrice.length} products without prices (showing first 100):\n`);
    console.log('='.repeat(80));

    const output = [];
    
    productsWithoutPrice.forEach((product, index) => {
      const productName = product.Name || product.name || product.title || 'Unnamed Product';
      const brand = product.brand || 'No Brand';
      const category = product.category || 'No Category';
      const price = product.price || 0;
      
      const line = `${index + 1}. ${productName}\n   Brand: ${brand} | Category: ${category} | Price: ${price}`;
      console.log(line);
      console.log('-'.repeat(80));
      
      output.push({
        id: product._id.toString(),
        name: productName,
        brand: brand,
        category: category,
        price: price
      });
    });

    // Save to file
    const outputPath = path.join(__dirname, 'products-without-prices-db.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n📄 Full list saved to: ${outputPath}`);

    console.log('\n📊 Summary:');
    console.log(`Total products without prices shown: ${productsWithoutPrice.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Database connection closed');
  }
}

showProductsWithoutPrices();
