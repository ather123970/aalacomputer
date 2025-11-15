const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Product = require('../models/Product');

async function updateImageUrls() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get all products with external zahcomputers.pk URLs
    const result = await Product.updateMany(
      {
        $or: [
          { img: { $regex: 'zahcomputers.pk' } },
          { imageUrl: { $regex: 'zahcomputers.pk' } },
          { image: { $regex: 'zahcomputers.pk' } }
        ]
      },
      {
        $set: {
          img: '',
          imageUrl: '',
          image: ''
        }
      }
    );

    console.log(`✅ Cleared ${result.modifiedCount} products with external URLs`);
    console.log('\n📝 Now products will use SmartImage fallback system');
    console.log('   which will try to find images in /images/ folder\n');

    // Show sample of updated products
    const sample = await Product.find({
      img: { $in: ['', null] }
    }).limit(5);

    console.log('Sample products (will use fallback):');
    sample.forEach(p => {
      console.log(`   - ${p.Name || p.name}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateImageUrls();
