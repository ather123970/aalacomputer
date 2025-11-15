/**
 * VERIFY ALL PRODUCTS
 * Checks product data integrity and generates report
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aalacomputer';

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function verifyAllProducts() {
  console.log('\n📋 VERIFYING ALL PRODUCTS\n');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    const issues = [];
    const stats = {
      total: 0,
      missingName: 0,
      missingPrice: 0,
      missingCategory: 0,
      missingImage: 0,
      valid: 0
    };
    
    // Fetch all products
    const products = await Product.find({}).lean();
    stats.total = products.length;
    
    console.log(`Found ${stats.total} products. Analyzing...\n`);
    
    // Check each product
    for (const product of products) {
      let hasIssues = false;
      const productIssues = [];
      
      const productName = product.name || product.Name || product.title || 'Unnamed';
      
      // Check name
      if (!product.name && !product.Name && !product.title) {
        stats.missingName++;
        productIssues.push('Missing name/title');
        hasIssues = true;
      }
      
      // Check price
      if (!product.price || product.price === 0 || product.price === '0') {
        stats.missingPrice++;
        productIssues.push('Missing/zero price');
        hasIssues = true;
      }
      
      // Check category
      if (!product.category || product.category === '') {
        stats.missingCategory++;
        productIssues.push('Missing category');
        hasIssues = true;
      }
      
      // Check image
      if (!product.img && !product.imageUrl && !product.image) {
        stats.missingImage++;
        productIssues.push('Missing image');
        hasIssues = true;
      }
      
      if (hasIssues) {
        issues.push({
          id: product._id,
          name: productName.substring(0, 60),
          issues: productIssues
        });
      } else {
        stats.valid++;
      }
    }
    
    // Print summary
    console.log('='.repeat(70));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Products: ${stats.total}`);
    console.log(`Valid Products: ${stats.valid} (${((stats.valid/stats.total)*100).toFixed(1)}%)`);
    console.log(`\nIssues Found:`);
    console.log(`  - Missing Name: ${stats.missingName}`);
    console.log(`  - Missing Price: ${stats.missingPrice}`);
    console.log(`  - Missing Category: ${stats.missingCategory}`);
    console.log(`  - Missing Image: ${stats.missingImage}`);
    console.log('='.repeat(70));
    
    // Category breakdown
    console.log('\nCATEGORY BREAKDOWN:');
    console.log('='.repeat(70));
    
    const categoryCount = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} products`);
    });
    
    // Show first 10 issues if any
    if (issues.length > 0) {
      console.log('\n='.repeat(70));
      console.log(`FIRST 10 PRODUCTS WITH ISSUES:`);
      console.log('='.repeat(70));
      
      issues.slice(0, 10).forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.name}`);
        console.log(`   ID: ${issue.id}`);
        console.log(`   Issues: ${issue.issues.join(', ')}`);
      });
      
      if (issues.length > 10) {
        console.log(`\n... and ${issues.length - 10} more products with issues`);
      }
    }
    
    console.log('\n✅ Verification Complete\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

verifyAllProducts();
