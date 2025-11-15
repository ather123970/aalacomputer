const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('bufferCommands', false);

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected!');
    console.log('Database:', mongoose.connection.name);
    
    // Try to get collection stats
    const Product = require('./backend/models/Product');
    
    console.log('\nTesting product count...');
    const count = await Product.countDocuments().maxTimeMS(30000);
    console.log(`Total products: ${count}`);
    
    console.log('\nTesting products without prices...');
    const noPriceCount = await Product.countDocuments({
      $or: [
        { price: 0 },
        { price: null },
        { price: { $exists: false } }
      ]
    }).maxTimeMS(30000);
    console.log(`Products without prices: ${noPriceCount}`);
    
    console.log('\nFetching sample products without price...');
    const sampleProducts = await Product.find({
      $or: [
        { price: 0 },
        { price: null },
        { price: { $exists: false } }
      ]
    })
    .select('Name name title price')
    .limit(5)
    .lean()
    .maxTimeMS(30000);
    
    console.log('\nSample products:');
    sampleProducts.forEach(p => {
      console.log(`- ${p.Name || p.name || p.title} (Price: ${p.price || 'N/A'})`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();
