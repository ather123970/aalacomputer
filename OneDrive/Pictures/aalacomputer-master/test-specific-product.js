/**
 * TEST SPECIFIC PRODUCT SEARCH
 * Search for: SAPPHIRE PULSE Radeon RX 550 4GB GDDR5 Video Card – Refurbished
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function testProductSearch() {
  console.log('\n🔍 Testing Search for SAPPHIRE PULSE Radeon RX 550\n');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Search with full product name
    console.log('='.repeat(70));
    console.log('Test 1: Search "SAPPHIRE PULSE Radeon RX 550"');
    console.log('='.repeat(70));
    
    const searchWords = ['SAPPHIRE', 'PULSE', 'Radeon', 'RX', '550'];
    const andConditions = [];
    
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
    
    const results = await Product.find({
      $and: andConditions
    }).limit(10);
    
    console.log(`\nFound ${results.length} matching products:\n`);
    
    if (results.length === 0) {
      console.log('❌ No products found!\n');
      
      // Try searching for just SAPPHIRE
      console.log('Trying broader search for "SAPPHIRE"...\n');
      const sapphireProducts = await Product.find({
        $or: [
          { name: { $regex: 'SAPPHIRE', $options: 'i' } },
          { Name: { $regex: 'SAPPHIRE', $options: 'i' } },
          { title: { $regex: 'SAPPHIRE', $options: 'i' } },
          { brand: { $regex: 'SAPPHIRE', $options: 'i' } }
        ]
      }).limit(10);
      
      console.log(`Found ${sapphireProducts.length} SAPPHIRE products:`);
      sapphireProducts.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name || p.Name || p.title || 'Unnamed'}`);
        console.log(`     ID: ${p._id}`);
        console.log(`     Category: ${p.category || 'N/A'}`);
        console.log(`     Brand: ${p.brand || 'N/A'}\n`);
      });
    } else {
      results.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name || p.Name || p.title || 'Unnamed'}`);
        console.log(`   ID: ${p._id}`);
        console.log(`   Category: ${p.category || 'N/A'}`);
        console.log(`   Brand: ${p.brand || 'N/A'}`);
        console.log(`   Price: ${p.price || 'N/A'}`);
        console.log(`   Image: ${p.img || p.imageUrl || 'N/A'}`);
        console.log('');
      });
    }
    
    // Test 2: Search with shorter query
    console.log('='.repeat(70));
    console.log('Test 2: Shorter search "SAPPHIRE RX 550"');
    console.log('='.repeat(70));
    
    const shortSearch = ['SAPPHIRE', 'RX', '550'];
    const shortConditions = [];
    
    shortSearch.forEach(word => {
      shortConditions.push({
        $or: [
          { name: { $regex: word, $options: 'i' } },
          { title: { $regex: word, $options: 'i' } },
          { Name: { $regex: word, $options: 'i' } },
          { description: { $regex: word, $options: 'i' } },
          { brand: { $regex: word, $options: 'i' } }
        ]
      });
    });
    
    const shortResults = await Product.find({
      $and: shortConditions
    }).limit(10);
    
    console.log(`\nFound ${shortResults.length} matching products:\n`);
    shortResults.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name || p.Name || p.title || 'Unnamed'}`);
      console.log(`   ID: ${p._id}`);
      console.log(`   Category: ${p.category || 'N/A'}\n`);
    });
    
    // Test 3: Check if product exists at all
    console.log('='.repeat(70));
    console.log('Test 3: Check if product exists (any SAPPHIRE RX 550)');
    console.log('='.repeat(70));
    
    const existsCheck = await Product.find({
      $or: [
        { name: { $regex: 'SAPPHIRE.*RX.*550', $options: 'i' } },
        { Name: { $regex: 'SAPPHIRE.*RX.*550', $options: 'i' } },
        { title: { $regex: 'SAPPHIRE.*RX.*550', $options: 'i' } }
      ]
    });
    
    console.log(`\nFound ${existsCheck.length} products with regex pattern:\n`);
    existsCheck.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name || p.Name || p.title || 'Unnamed'}`);
      console.log(`   ID: ${p._id}`);
      console.log(`   Full name: ${p.name || p.Name || p.title}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('✅ Test Complete\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testProductSearch();
