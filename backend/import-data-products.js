const mongoose = require('mongoose');
const Product = require('./models/Product.js');
const fs = require('fs');
const path = require('path');

async function importProducts() {
  try {
    // Get MongoDB URI from environment or use MongoDB Atlas as fallback (no local URI)
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!');

    const productsFile = path.join(__dirname, 'data', 'products.json');
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log('Found', products.length, 'products');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert all products
    await Product.insertMany(products);
    console.log('Import completed!');

    const count = await Product.countDocuments();
    console.log('Total products in DB:', count);

    // Show sample product
    const sample = await Product.findOne({ category: 'PC' });
    console.log('Sample PC product:', JSON.stringify(sample, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importProducts();