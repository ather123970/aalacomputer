/**
 * Quick Database Connection Test
 * Checks if we can connect and see products
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

async function check() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections in database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check for products in different collection names
    const possibleCollections = ['products', 'Products', 'product', 'Product'];
    
    console.log('\n🔍 Checking for products...\n');
    
    for (const collName of possibleCollections) {
      try {
        const count = await mongoose.connection.db.collection(collName).countDocuments();
        if (count > 0) {
          console.log(`✅ Found ${count} documents in "${collName}" collection`);
          
          // Get sample
          const sample = await mongoose.connection.db.collection(collName).findOne({});
          console.log('\n📄 Sample document fields:');
          console.log(Object.keys(sample).join(', '));
          console.log('\n📄 Sample product:');
          console.log(`   Name: ${sample.name || sample.Name || sample.title || '(no name)'}`);
          console.log(`   Category: ${sample.category || '(no category)'}`);
          console.log(`   Brand: ${sample.brand || '(no brand)'}`);
          console.log('');
        }
      } catch (err) {
        // Collection doesn't exist, skip
      }
    }
    
    await mongoose.connection.close();
    console.log('👋 Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
