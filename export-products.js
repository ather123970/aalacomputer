/**
 * Export all products from MongoDB to JSON file
 */

const fs = require('fs');
const path = require('path');

// You'll need to install mongodb: npm install mongodb
const { MongoClient } = require('mongodb');

// Update this with your MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017'; // Update this
const DATABASE_NAME = 'aalacomputer'; // Update this
const COLLECTION_NAME = 'products'; // Update this

async function exportProducts() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('📥 Fetching all products...');
    const products = await collection.find({}).toArray();
    
    console.log(`✅ Found ${products.length} products\n`);

    // Write to file
    const outputFile = path.join(__dirname, 'allproducts.json');
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
    
    console.log(`💾 Exported to: ${outputFile}`);
    console.log(`📊 File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Connection closed');
  }
}

exportProducts();
