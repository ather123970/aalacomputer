/**
 * LIST PRODUCTS WITHOUT PRICES
 * Simple list output
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
  brand: String
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

async function listProductsWithoutPrices() {
  await mongoose.connect(MONGODB_URI);
  
  const allProducts = await Product.find({}).lean();
  const productsWithoutPrices = [];
  
  for (const product of allProducts) {
    const name = product.name || product.Name || product.title || 'Unnamed Product';
    const price = product.price || product.Price || product.salePrice || product.regularPrice || 0;
    
    if (!price || price === 0 || price === '0') {
      productsWithoutPrices.push(name);
    }
  }
  
  console.log('\n========================================');
  console.log('PRODUCTS WITHOUT PRICES (' + productsWithoutPrices.length + ' total)');
  console.log('========================================\n');
  
  productsWithoutPrices.forEach((name, index) => {
    console.log((index + 1) + '. ' + name);
  });
  
  console.log('\n========================================');
  console.log('Total: ' + productsWithoutPrices.length + ' products');
  console.log('========================================\n');
  
  await mongoose.connection.close();
}

listProductsWithoutPrices();
