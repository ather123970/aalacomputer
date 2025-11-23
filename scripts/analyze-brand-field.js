const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

async function analyzeBrandField() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    console.log('📊 ANALYZING BRAND FIELD IN DATABASE\n');
    console.log('=' .repeat(60));

    // Get total count
    const totalProducts = await productsCollection.countDocuments();
    console.log(`📦 Total Products: ${totalProducts}\n`);

    // Count products with brand value
    const withBrand = await productsCollection.countDocuments({
      brand: { $exists: true, $ne: null, $ne: '' }
    });

    // Count products with empty brand
    const emptyBrand = await productsCollection.countDocuments({
      $or: [
        { brand: { $exists: false } },
        { brand: null },
        { brand: '' }
      ]
    });

    // Count products with brand = undefined or 'undefined'
    const undefinedBrand = await productsCollection.countDocuments({
      brand: 'undefined'
    });

    // Get unique brands
    const uniqueBrands = await productsCollection.distinct('brand');
    const validBrands = uniqueBrands.filter(b => b && b !== '' && b !== 'undefined' && b !== null);

    console.log('📈 BRAND STATISTICS:\n');
    console.log(`✅ Products WITH brand value:     ${withBrand} (${((withBrand/totalProducts)*100).toFixed(2)}%)`);
    console.log(`❌ Products WITHOUT brand value:  ${emptyBrand} (${((emptyBrand/totalProducts)*100).toFixed(2)}%)`);
    console.log(`⚠️  Products with 'undefined':    ${undefinedBrand}`);
    console.log(`\n🏷️  Total UNIQUE brands:          ${validBrands.length}`);
    console.log(`📋 Total UNIQUE values (incl. empty): ${uniqueBrands.length}\n`);

    console.log('=' .repeat(60));
    console.log('\n📝 BREAKDOWN:\n');

    // Show breakdown of empty values
    const emptyCount = await productsCollection.countDocuments({ brand: '' });
    const nullCount = await productsCollection.countDocuments({ brand: null });
    const notExistCount = await productsCollection.countDocuments({ brand: { $exists: false } });

    console.log(`Empty string (""): ${emptyCount}`);
    console.log(`Null value: ${nullCount}`);
    console.log(`Field doesn't exist: ${notExistCount}`);
    console.log(`String "undefined": ${undefinedBrand}\n`);

    console.log('=' .repeat(60));
    console.log('\n🏢 TOP 20 BRANDS:\n');

    // Get top brands by count
    const topBrands = await productsCollection.aggregate([
      { $match: { brand: { $exists: true, $ne: null, $ne: '', $ne: 'undefined' } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).toArray();

    topBrands.forEach((item, index) => {
      console.log(`${index + 1}. ${item._id || '(empty)'}: ${item.count} products`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('\n✨ SUMMARY:\n');
    console.log(`Total Products:        ${totalProducts}`);
    console.log(`With Brand:            ${withBrand} (${((withBrand/totalProducts)*100).toFixed(2)}%)`);
    console.log(`Without Brand:         ${emptyBrand} (${((emptyBrand/totalProducts)*100).toFixed(2)}%)`);
    console.log(`Unique Valid Brands:   ${validBrands.length}`);

    console.log('\n✅ Analysis complete!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeBrandField();
