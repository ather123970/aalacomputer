#!/usr/bin/env node

/**
 * Search for products with zahcomputer.pk image URLs in MongoDB
 * Usage: node search-zahcomputer-images.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer';

// Product Schema
const ProductSchema = new mongoose.Schema({}, { strict: false });

async function searchZahcomputerImages() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const Product = mongoose.model('Product', ProductSchema, 'products');

    // Search for zahcomputer.pk in img field
    console.log('📊 Searching for zahcomputer.pk image URLs...\n');

    const query = {
      $or: [
        { img: { $regex: 'zahcomputer\\.pk', $options: 'i' } },
        { imageUrl: { $regex: 'zahcomputer\\.pk', $options: 'i' } },
        { image: { $regex: 'zahcomputer\\.pk', $options: 'i' } }
      ]
    };

    // Get count
    const count = await Product.countDocuments(query);
    console.log(`📈 Total products with zahcomputer.pk images: ${count}\n`);

    if (count === 0) {
      console.log('✅ No products found with zahcomputer.pk image URLs');
      await mongoose.connection.close();
      return;
    }

    // Get detailed results
    const products = await Product.find(query)
      .select('_id id name title price img imageUrl image category')
      .limit(100)
      .lean();

    console.log('📋 Sample products with zahcomputer.pk images:\n');
    console.log('═'.repeat(100));

    products.forEach((product, index) => {
      const imgUrl = product.img || product.imageUrl || product.image || 'N/A';
      console.log(`\n${index + 1}. Product ID: ${product._id || product.id}`);
      console.log(`   Name: ${product.name || product.title || 'Unknown'}`);
      console.log(`   Category: ${product.category || 'N/A'}`);
      console.log(`   Price: Rs. ${product.price || 'N/A'}`);
      console.log(`   Image URL: ${imgUrl}`);
    });

    console.log('\n' + '═'.repeat(100));
    console.log(`\n✅ Found ${count} products with zahcomputer.pk image URLs`);

    // Get breakdown by field
    console.log('\n📊 Breakdown by field:');
    
    const imgCount = await Product.countDocuments({
      img: { $regex: 'zahcomputer\\.pk', $options: 'i' }
    });
    console.log(`   - img field: ${imgCount}`);

    const imageUrlCount = await Product.countDocuments({
      imageUrl: { $regex: 'zahcomputer\\.pk', $options: 'i' }
    });
    console.log(`   - imageUrl field: ${imageUrlCount}`);

    const imageCount = await Product.countDocuments({
      image: { $regex: 'zahcomputer\\.pk', $options: 'i' }
    });
    console.log(`   - image field: ${imageCount}`);

    // Get breakdown by category
    console.log('\n📂 Breakdown by category:');
    const categoryBreakdown = await Product.aggregate([
      {
        $match: {
          $or: [
            { img: { $regex: 'zahcomputer\\.pk', $options: 'i' } },
            { imageUrl: { $regex: 'zahcomputer\\.pk', $options: 'i' } },
            { image: { $regex: 'zahcomputer\\.pk', $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    categoryBreakdown.forEach(cat => {
      console.log(`   - ${cat._id || 'Uncategorized'}: ${cat.count}`);
    });

    console.log('\n✅ Search complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

searchZahcomputerImages();
