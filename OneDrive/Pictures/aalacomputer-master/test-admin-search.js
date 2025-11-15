/**
 * TEST ADMIN SEARCH FUNCTIONALITY
 * This script tests if the admin search can find products in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

// Simple product schema
const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function testSearch() {
  console.log('\n🔍 Testing Admin Search Functionality\n');
  
  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Check if product exists
    console.log('Test 1: Searching for "HP EliteBook 840 G7"');
    console.log('='.repeat(70));
    
    const exactSearch = await Product.find({
      $or: [
        { name: { $regex: 'HP EliteBook 840 G7', $options: 'i' } },
        { Name: { $regex: 'HP EliteBook 840 G7', $options: 'i' } },
        { title: { $regex: 'HP EliteBook 840 G7', $options: 'i' } }
      ]
    }).limit(5);
    
    console.log(`Found ${exactSearch.length} products with exact phrase match`);
    exactSearch.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name || p.Name || p.title || 'Unnamed'}`);
      console.log(`     ID: ${p._id}`);
      console.log(`     Fields: name="${p.name}", Name="${p.Name}", title="${p.title}"`);
    });
    
    // Test 2: Test NEW word-by-word search with AND logic (FIXED)
    console.log('\n' + '='.repeat(70));
    console.log('Test 2: NEW Search - ALL words must be present (HP, EliteBook, 840, G7, Core)');
    console.log('='.repeat(70));
    
    const searchWords = ['HP', 'EliteBook', '840', 'G7', 'Core'];
    const andConditions = [];
    
    // For each word, create an OR condition across all fields
    searchWords.forEach(word => {
      andConditions.push({
        $or: [
          { name: { $regex: word, $options: 'i' } },
          { title: { $regex: word, $options: 'i' } },
          { Name: { $regex: word, $options: 'i' } },
          { description: { $regex: word, $options: 'i' } },
          { brand: { $regex: word, $options: 'i' } },
          { category: { $regex: word, $options: 'i' } }
        ]
      });
    });
    
    const wordSearch = await Product.find({
      $and: andConditions
    }).limit(10);
    
    console.log(`Found ${wordSearch.length} products where ALL words are present`);
    wordSearch.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name || p.Name || p.title || 'Unnamed'}`);
      console.log(`     ID: ${p._id}`);
      console.log(`     Category: ${p.category || 'N/A'}`);
    });
    
    // Test 3: List all products with "HP" to see what we have
    console.log('\n' + '='.repeat(70));
    console.log('Test 3: All products containing "HP" (first 20)');
    console.log('='.repeat(70));
    
    const hpProducts = await Product.find({
      $or: [
        { name: { $regex: 'HP', $options: 'i' } },
        { Name: { $regex: 'HP', $options: 'i' } },
        { title: { $regex: 'HP', $options: 'i' } },
        { brand: { $regex: 'HP', $options: 'i' } }
      ]
    }).limit(20);
    
    console.log(`Found ${hpProducts.length} HP products:`);
    hpProducts.forEach((p, i) => {
      const productName = p.name || p.Name || p.title || 'Unnamed';
      console.log(`  ${i + 1}. ${productName.substring(0, 80)}`);
    });
    
    // Test 4: Count total products
    console.log('\n' + '='.repeat(70));
    console.log('Test 4: Database Statistics');
    console.log('='.repeat(70));
    
    const totalProducts = await Product.countDocuments();
    const productsWithName = await Product.countDocuments({ name: { $exists: true, $ne: null, $ne: '' } });
    const productsWithNameUpper = await Product.countDocuments({ Name: { $exists: true, $ne: null, $ne: '' } });
    const productsWithTitle = await Product.countDocuments({ title: { $exists: true, $ne: null, $ne: '' } });
    
    console.log(`Total products: ${totalProducts}`);
    console.log(`Products with 'name' field: ${productsWithName}`);
    console.log(`Products with 'Name' field: ${productsWithNameUpper}`);
    console.log(`Products with 'title' field: ${productsWithTitle}`);
    
    console.log('\n✅ Test Complete\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSearch();
