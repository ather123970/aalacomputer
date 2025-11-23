#!/usr/bin/env node

/**
 * Comprehensive image URL analysis for all products
 * Shows breakdown of image sources across database
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer';

const ProductSchema = new mongoose.Schema({}, { strict: false });

async function analyzeImageUrls() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const Product = mongoose.model('Product', ProductSchema, 'products');

    // Get total product count
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}\n`);

    // Image source analysis
    console.log('🖼️  IMAGE SOURCE ANALYSIS:\n');
    console.log('═'.repeat(80));

    // 1. Zahcomputer.pk images
    const zahcomputerCount = await Product.countDocuments({
      $or: [
        { img: { $regex: 'zahcomputer\\.pk', $options: 'i' } },
        { imageUrl: { $regex: 'zahcomputer\\.pk', $options: 'i' } },
        { image: { $regex: 'zahcomputer\\.pk', $options: 'i' } }
      ]
    });
    console.log(`\n1️⃣  Zahcomputer.pk images: ${zahcomputerCount} products (${((zahcomputerCount/totalProducts)*100).toFixed(2)}%)`);

    // 2. Aalacomputer images
    const aalacomputerCount = await Product.countDocuments({
      $or: [
        { img: { $regex: 'aalacomputer|aala', $options: 'i' } },
        { imageUrl: { $regex: 'aalacomputer|aala', $options: 'i' } },
        { image: { $regex: 'aalacomputer|aala', $options: 'i' } }
      ]
    });
    console.log(`2️⃣  Aalacomputer images: ${aalacomputerCount} products (${((aalacomputerCount/totalProducts)*100).toFixed(2)}%)`);

    // 3. Via.placeholder images
    const placeholderCount = await Product.countDocuments({
      $or: [
        { img: { $regex: 'via\\.placeholder|placeholder', $options: 'i' } },
        { imageUrl: { $regex: 'via\\.placeholder|placeholder', $options: 'i' } },
        { image: { $regex: 'via\\.placeholder|placeholder', $options: 'i' } }
      ]
    });
    console.log(`3️⃣  Placeholder images: ${placeholderCount} products (${((placeholderCount/totalProducts)*100).toFixed(2)}%)`);

    // 4. Local images (no http/https)
    const localCount = await Product.countDocuments({
      $or: [
        { img: { $regex: '^(?!https?://)', $options: 'i' }, img: { $ne: '' } },
        { imageUrl: { $regex: '^(?!https?://)', $options: 'i' }, imageUrl: { $ne: '' } }
      ]
    });
    console.log(`4️⃣  Local/relative images: ${localCount} products (${((localCount/totalProducts)*100).toFixed(2)}%)`);

    // 5. External URLs (http/https)
    const externalCount = await Product.countDocuments({
      $or: [
        { img: { $regex: '^https?://', $options: 'i' } },
        { imageUrl: { $regex: '^https?://', $options: 'i' } },
        { image: { $regex: '^https?://', $options: 'i' } }
      ]
    });
    console.log(`5️⃣  External URLs: ${externalCount} products (${((externalCount/totalProducts)*100).toFixed(2)}%)`);

    // 6. Missing images
    const missingCount = await Product.countDocuments({
      $and: [
        { $or: [{ img: '' }, { img: null }, { img: { $exists: false } }] },
        { $or: [{ imageUrl: '' }, { imageUrl: null }, { imageUrl: { $exists: false } }] },
        { $or: [{ image: '' }, { image: null }, { image: { $exists: false } }] }
      ]
    });
    console.log(`6️⃣  Missing images: ${missingCount} products (${((missingCount/totalProducts)*100).toFixed(2)}%)`);

    // Domain breakdown for external URLs
    console.log('\n' + '═'.repeat(80));
    console.log('\n🌐 EXTERNAL DOMAIN BREAKDOWN:\n');

    const domainBreakdown = await Product.aggregate([
      {
        $match: {
          $or: [
            { img: { $regex: '^https?://', $options: 'i' } },
            { imageUrl: { $regex: '^https?://', $options: 'i' } },
            { image: { $regex: '^https?://', $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          url: {
            $cond: [
              { $regexMatch: { input: '$img', regex: '^https?://', options: 'i' } },
              '$img',
              { $cond: [
                { $regexMatch: { input: '$imageUrl', regex: '^https?://', options: 'i' } },
                '$imageUrl',
                '$image'
              ]}
            ]
          }
        }
      },
      {
        $project: {
          domain: {
            $regexFind: {
              input: '$url',
              regex: 'https?://([^/]+)',
              options: 'i'
            }
          }
        }
      },
      {
        $unwind: '$domain'
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$domain.captures', 0] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    domainBreakdown.forEach((domain, index) => {
      console.log(`   ${index + 1}. ${domain._id || 'Unknown'}: ${domain.count} products`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Analysis complete!\n');

    // Summary
    console.log('📌 SUMMARY:');
    console.log(`   • Total Products: ${totalProducts}`);
    console.log(`   • Zahcomputer.pk: ${zahcomputerCount} (${((zahcomputerCount/totalProducts)*100).toFixed(2)}%)`);
    console.log(`   • With Images: ${externalCount + localCount} (${(((externalCount + localCount)/totalProducts)*100).toFixed(2)}%)`);
    console.log(`   • Missing Images: ${missingCount} (${((missingCount/totalProducts)*100).toFixed(2)}%)`);
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

analyzeImageUrls();
