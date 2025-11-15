/**
 * FIX MOTHERBOARD CATEGORIZATION
 * Finds and fixes motherboards that were incorrectly categorized as Processors
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function fixMotherboardCategories() {
  console.log('🔧 Starting to fix motherboard categorization...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find products that:
    // 1. Have motherboard keywords in their name/title
    // 2. Are categorized as "Processors" or "CPU"
    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: /motherboard|mobo|mainboard|B650|B550|B760|B450|X670|X570|Z790|Z690|Z490|H610|H510|LGA 1700|LGA 1851|LGA 1200|Socket AM5|Socket AM4/i } },
            { title: { $regex: /motherboard|mobo|mainboard|B650|B550|B760|B450|X670|X570|Z790|Z690|Z490|H610|H510|LGA 1700|LGA 1851|LGA 1200|Socket AM5|Socket AM4/i } },
            { Name: { $regex: /motherboard|mobo|mainboard|B650|B550|B760|B450|X670|X570|Z790|Z690|Z490|H610|H510|LGA 1700|LGA 1851|LGA 1200|Socket AM5|Socket AM4/i } }
          ]
        },
        {
          $or: [
            { category: { $regex: /^processor$/i } },
            { category: { $regex: /^processors$/i } },
            { category: { $regex: /^cpu$/i } }
          ]
        }
      ]
    };

    const miscategorizedProducts = await Product.find(query);
    
    console.log(`📊 Found ${miscategorizedProducts.length} miscategorized motherboards\n`);

    if (miscategorizedProducts.length === 0) {
      console.log('✅ No miscategorized motherboards found. All good!\n');
      await mongoose.disconnect();
      return;
    }

    // Show the products that will be updated
    console.log('📋 Products to be updated:\n');
    miscategorizedProducts.forEach((product, index) => {
      const productName = product.Name || product.name || product.title || 'Unnamed';
      const currentCategory = product.category || 'None';
      console.log(`${index + 1}. ${productName}`);
      console.log(`   Current Category: ${currentCategory}`);
      console.log(`   Brand: ${product.brand || 'Unknown'}\n`);
    });

    // Update the products
    const updateResult = await Product.updateMany(
      query,
      { 
        $set: { 
          category: 'Motherboards'
        } 
      }
    );

    console.log(`\n✅ Successfully updated ${updateResult.modifiedCount} products`);
    console.log(`   Changed category from "Processors" to "Motherboards"\n`);

    // Verify the fix
    const verifyQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: /motherboard|mobo|mainboard/i } },
            { title: { $regex: /motherboard|mobo|mainboard/i } },
            { Name: { $regex: /motherboard|mobo|mainboard/i } }
          ]
        },
        {
          category: { $regex: /^motherboards$/i }
        }
      ]
    };

    const verifiedCount = await Product.countDocuments(verifyQuery);
    console.log(`✅ Verification: ${verifiedCount} motherboards now have correct category\n`);

    // Also check for other potential issues (motherboards with wrong categories)
    const allMotherboardNames = await Product.find({
      $or: [
        { name: { $regex: /motherboard|mobo|mainboard|B650|B550|Z790|Z690|X670|X570|LGA 1700|LGA 1851|AM4|AM5/i } },
        { title: { $regex: /motherboard|mobo|mainboard|B650|B550|Z790|Z690|X670|X570|LGA 1700|LGA 1851|AM4|AM5/i } },
        { Name: { $regex: /motherboard|mobo|mainboard|B650|B550|Z790|Z690|X670|X570|LGA 1700|LGA 1851|AM4|AM5/i } }
      ]
    }).select('Name name title category brand');

    // Count by category
    const categoryCounts = {};
    allMotherboardNames.forEach(product => {
      const cat = product.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    console.log('📊 Current distribution of motherboard-like products:\n');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });

    console.log('\n🎉 Fix completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run the script
fixMotherboardCategories().catch(console.error);
