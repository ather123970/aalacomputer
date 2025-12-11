const mongoose = require('mongoose');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority', {
});

async function checkEmptyBrandFields() {
  try {
    console.log('🔍 Checking database for empty brand fields...\n');

    // Get total products count
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}\n`);

    // Check different types of empty brand fields
    const checks = [
      {
        name: 'Products with brand = "" (empty string)',
        query: { brand: '' },
        description: 'Brand field is empty string'
      },
      {
        name: 'Products with brand = null',
        query: { brand: null },
        description: 'Brand field is null'
      },
      {
        name: 'Products with brand = undefined',
        query: { brand: { $exists: false } },
        description: 'Brand field does not exist'
      },
      {
        name: 'Products with brand = "empty"',
        query: { brand: 'empty' },
        description: 'Brand field is literally "empty"'
      },
      {
        name: 'Products with brand containing only whitespace',
        query: { brand: { $regex: /^\s*$/ } },
        description: 'Brand field contains only whitespace'
      }
    ];

    let totalEmptyBrands = 0;
    const sampleProducts = [];

    for (const check of checks) {
      const count = await Product.countDocuments(check.query);
      totalEmptyBrands += count;
      
      console.log(`🔍 ${check.name}:`);
      console.log(`   Count: ${count}`);
      console.log(`   Description: ${check.description}`);
      
      if (count > 0) {
        // Get sample products for this check
        const samples = await Product.find(check.query).limit(3).lean();
        samples.forEach((product, idx) => {
          console.log(`   Sample ${idx + 1}: "${product.name || product.Name || product.title}" - Brand: "${product.brand}"`);
          sampleProducts.push({
            ...product,
            emptyType: check.name,
            brandValue: product.brand
          });
        });
      }
      console.log('');
    }

    // Summary
    console.log(`📋 SUMMARY:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products with empty/missing brands: ${totalEmptyBrands}`);
    console.log(`   Products with valid brands: ${totalProducts - totalEmptyBrands}`);
    console.log(`   Percentage with empty brands: ${((totalEmptyBrands / totalProducts) * 100).toFixed(2)}%\n`);

    // Check if the frontend logic matches
    console.log('🔍 Testing frontend filter logic...');
    const frontendFilterTest = await Product.find({
      $or: [
        { brand: '' },
        { brand: null },
        { brand: 'empty' },
        { brand: { $exists: false } }
      ]
    });
    
    console.log(`   Frontend filter would find: ${frontendFilterTest.length} products`);
    
    if (frontendFilterTest.length > 0) {
      console.log('   First 5 products that frontend would process:');
      frontendFilterTest.slice(0, 5).forEach((product, idx) => {
        console.log(`     ${idx + 1}. "${product.name || product.Name || product.title}" - Brand: "${product.brand}"`);
      });
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      totalProducts,
      emptyBrandCounts: checks.map(check => ({
        ...check,
        count: 0 // Will be filled below
      })),
      totalEmptyBrands,
      sampleProducts: sampleProducts.slice(0, 20) // Keep first 20 samples
    };

    // Fill in counts for report
    for (const check of report.emptyBrandCounts) {
      check.count = await Product.countDocuments(check.query);
    }

    require('fs').writeFileSync(
      './empty_brand_report.json', 
      JSON.stringify(report, null, 2)
    );

    console.log('\n💾 Detailed report saved to: empty_brand_report.json');
    
  } catch (error) {
    console.error('❌ Error checking brand fields:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkEmptyBrandFields();
