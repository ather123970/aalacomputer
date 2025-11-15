/**
 * FINAL CATEGORY FIX
 * Precisely fixes product categorization with strict rules
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function finalCategoryFix() {
  console.log('🔧 Starting final category fix...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // STEP 1: Fix motherboards in Processors category
    console.log('📍 Step 1: Fixing motherboards in Processors category...\n');
    
    const motherboardQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: /motherboard|mobo/i } },
            { title: { $regex: /motherboard|mobo/i } },
            { Name: { $regex: /motherboard|mobo/i } }
          ]
        },
        {
          category: { $regex: /^processors?$/i }
        }
      ]
    };

    const motherboards = await Product.find(motherboardQuery);
    console.log(`   Found ${motherboards.length} motherboards in Processors category`);
    
    if (motherboards.length > 0) {
      console.log('\n   Products to fix:\n');
      motherboards.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.Name || p.name || p.title} (${p.brand || 'Unknown'})`);
      });
      
      await Product.updateMany(motherboardQuery, { $set: { category: 'Motherboards' } });
      console.log(`\n   ✅ Updated ${motherboards.length} motherboards\n`);
    }

    // STEP 2: Fix processors in Motherboards category
    console.log('📍 Step 2: Fixing processors in Motherboards category...\n');
    
    const processorQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: /(Intel Core|AMD Ryzen|Core i[35790]|Ryzen [35790]|Core Ultra|Threadripper)[\s-]\d+/i } },
            { title: { $regex: /(Intel Core|AMD Ryzen|Core i[35790]|Ryzen [35790]|Core Ultra|Threadripper)[\s-]\d+/i } },
            { Name: { $regex: /(Intel Core|AMD Ryzen|Core i[35790]|Ryzen [35790]|Core Ultra|Threadripper)[\s-]\d+/i } }
          ]
        },
        {
          category: { $regex: /^motherboards?$/i }
        },
        {
          $and: [
            { name: { $not: { $regex: /motherboard|mobo/i } } },
            { title: { $not: { $regex: /motherboard|mobo/i } } },
            { Name: { $not: { $regex: /motherboard|mobo/i } } }
          ]
        }
      ]
    };

    const processors = await Product.find(processorQuery);
    console.log(`   Found ${processors.length} processors in Motherboards category`);
    
    if (processors.length > 0) {
      console.log('\n   Products to fix:\n');
      processors.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.Name || p.name || p.title} (${p.brand || 'Unknown'})`);
      });
      
      await Product.updateMany(processorQuery, { $set: { category: 'Processors' } });
      console.log(`\n   ✅ Updated ${processors.length} processors\n`);
    }

    // STEP 3: Verify the fix
    console.log('📍 Step 3: Verifying the fix...\n');
    
    const processorCount = await Product.countDocuments({ 
      category: { $regex: /^processors?$/i },
      $or: [
        { name: { $regex: /processor|core i|ryzen|cpu/i } },
        { Name: { $regex: /processor|core i|ryzen|cpu/i } }
      ]
    });
    
    const motherboardCount = await Product.countDocuments({ 
      category: { $regex: /^motherboards?$/i },
      $or: [
        { name: { $regex: /motherboard|mobo/i } },
        { Name: { $regex: /motherboard|mobo/i } }
      ]
    });
    
    console.log(`   ✅ Processors category: ${processorCount} products`);
    console.log(`   ✅ Motherboards category: ${motherboardCount} products\n`);

    // STEP 4: Check for remaining issues
    console.log('📍 Step 4: Checking for remaining issues...\n');
    
    const remainingIssues1 = await Product.countDocuments({
      category: { $regex: /^processors?$/i },
      $or: [
        { name: { $regex: /motherboard|mobo/i } },
        { Name: { $regex: /motherboard|mobo/i } }
      ]
    });
    
    const remainingIssues2 = await Product.countDocuments({
      category: { $regex: /^motherboards?$/i },
      $and: [
        {
          $or: [
            { name: { $regex: /(Intel Core|AMD Ryzen|Core i[35790]|Ryzen [35790])[\s-]\d+/i } },
            { Name: { $regex: /(Intel Core|AMD Ryzen|Core i[35790]|Ryzen [35790])[\s-]\d+/i } }
          ]
        },
        {
          name: { $not: { $regex: /motherboard|mobo/i } },
          Name: { $not: { $regex: /motherboard|mobo/i } }
        }
      ]
    });
    
    if (remainingIssues1 > 0) {
      console.log(`   ⚠️  ${remainingIssues1} motherboards still in Processors category`);
    }
    
    if (remainingIssues2 > 0) {
      console.log(`   ⚠️  ${remainingIssues2} processors still in Motherboards category`);
    }
    
    if (remainingIssues1 === 0 && remainingIssues2 === 0) {
      console.log(`   ✅ No remaining issues found!\n`);
    }

    console.log('🎉 Final category fix completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run the script
finalCategoryFix().catch(console.error);
