// Check database collections and products
const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';
    console.log('Connecting to:', uri.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Available collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');
    
    // Try different collection names
    const possibleNames = ['products', 'product', 'Products', 'Product'];
    
    for (const collectionName of possibleNames) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`✅ Found ${count} documents in "${collectionName}" collection`);
          
          // Get sample document
          const sample = await mongoose.connection.db.collection(collectionName).findOne({});
          console.log('\n📄 Sample document:');
          console.log(JSON.stringify(sample, null, 2).substring(0, 500));
          console.log('...\n');
        }
      } catch (err) {
        // Collection doesn't exist, skip
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkDatabase();
