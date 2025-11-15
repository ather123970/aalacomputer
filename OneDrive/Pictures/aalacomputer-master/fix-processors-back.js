/**
 * FIX INCORRECTLY CATEGORIZED PROCESSORS
 * Fixes processors that were wrongly categorized as Motherboards
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function fixProcessorCategories() {
  console.log('🔧 Starting to fix processor categorization...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find products that:
    // 1. Have processor model names (Intel Core i3/i5/i7/i9, AMD Ryzen)
    // 2. Are categorized as "Motherboards"
    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: /(Intel Core|AMD Ryzen|Core i3|Core i5|Core i7|Core i9|Ryzen [35579]|Threadripper|Core Ultra) \d+/i } },
            { title: { $regex: /(Intel Core|AMD Ryzen|Core i3|Core i5|Core i7|Core i9|Ryzen [35579]|Threadripper|Core Ultra) \d+/i } },
            { Name: { $regex: /(Intel Core|AMD Ryzen|Core i3|Core i5|Core i7|Core i9|Ryzen [35579]|Threadripper|Core Ultra) \d+/i } }
          ]
        },
        {
          category: { $regex: /^motherboards$/i }
        },
        {
          $or: [
            { name: { $not: { $regex: /motherboard|mobo/i } } },
            { title: { $not: { $regex: /motherboard|mobo/i } } },
            { Name: { $not: { $regex: /motherboard|mobo/i } } }
          ]
        }
      ]
    };

    const miscategorizedProducts = await Product.find(query);
    
    console.log(`📊 Found ${miscategorizedProducts.length} processors incorrectly categorized as motherboards\n`);

    if (miscategorizedProducts.length === 0) {
      console.log('✅ No miscategorized processors found. All good!\n');
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
          category: 'Processors'
        } 
      }
    );

    console.log(`\n✅ Successfully updated ${updateResult.modifiedCount} products`);
    console.log(`   Changed category from "Motherboards" to "Processors"\n`);

    console.log('🎉 Fix completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run the script
fixProcessorCategories().catch(console.error);
