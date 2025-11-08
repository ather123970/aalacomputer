/**
 * UPDATE PRICES WITH BETTER MATCHING
 * Uses fuzzy matching to find products
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String,
  Name: String,
  title: String,
  price: Number,
  Price: Number,
  salePrice: Number,
  regularPrice: Number,
  category: String,
  brand: String
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.toString()
    .replace(/PKR/gi, '')
    .replace(/Rs\.?/gi, '')
    .replace(/,/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

function extractProductInfo(line) {
  const format1Match = line.match(/^(.+?)\s+Category:\s+(.+?)\s+Brand:\s+(.+?)\s+(?:Estimated Price:\s*)?(?:PKR|Rs\.?)\s*([\d,]+)/i);
  if (format1Match) {
    return {
      name: format1Match[1].trim(),
      price: parsePrice(format1Match[4])
    };
  }
  
  const tabParts = line.split('\t');
  if (tabParts.length >= 5) {
    return {
      name: tabParts[1].trim(),
      price: parsePrice(tabParts[4])
    };
  }
  
  const csvMatch = line.match(/^\d+,(.+?),(.+?),(.+?),"?([\d,]+)"?/);
  if (csvMatch) {
    return {
      name: csvMatch[1].trim().replace(/^"|"$/g, ''),
      price: parsePrice(csvMatch[4])
    };
  }
  
  const parts = line.split(',');
  if (parts.length >= 4) {
    return {
      name: parts[0].replace(/^\d+\.?\s*/, '').trim(),
      price: parsePrice(parts[3])
    };
  }
  
  return null;
}

function normalizeString(str) {
  return str.toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/["'`]/g, '')
    .trim();
}

async function findProduct(searchName) {
  const normalized = normalizeString(searchName);
  
  // Try exact match first
  let product = await Product.findOne({
    $or: [
      { name: searchName },
      { Name: searchName },
      { title: searchName }
    ]
  });
  
  if (product) return product;
  
  // Try case-insensitive
  product = await Product.findOne({
    $or: [
      { name: new RegExp(`^${searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      { Name: new RegExp(`^${searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      { title: new RegExp(`^${searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    ]
  });
  
  if (product) return product;
  
  // Try partial match (contains)
  product = await Product.findOne({
    $or: [
      { name: new RegExp(searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { Name: new RegExp(searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { title: new RegExp(searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
    ]
  });
  
  if (product) return product;
  
  // Try first 50 characters
  const shortName = searchName.substring(0, 50);
  product = await Product.findOne({
    $or: [
      { name: new RegExp(shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { Name: new RegExp(shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { title: new RegExp(shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
    ]
  });
  
  return product;
}

async function updatePrices() {
  console.log('\n💰 UPDATING PRICES WITH BETTER MATCHING\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');
  
  const filePath = path.join(__dirname, '..', '..', 'PRODUCTS_WITHOUT_PRICES.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let updated = 0;
  let notFound = 0;
  let skipped = 0;
  const notFoundList = [];
  
  console.log(`Processing ${lines.length} lines...\n`);
  
  for (const line of lines) {
    if (!line.trim() || line.includes('========') || line.includes('PRODUCTS WITHOUT') || line.includes('Total:') || line.includes('#,Product Name')) {
      continue;
    }
    
    const productInfo = extractProductInfo(line);
    
    if (!productInfo || !productInfo.price || productInfo.price === 0) {
      skipped++;
      continue;
    }
    
    const product = await findProduct(productInfo.name);
    
    if (product) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { price: productInfo.price, Price: productInfo.price } }
      );
      
      console.log(`✅ ${productInfo.name.substring(0, 55)}... → PKR ${productInfo.price.toLocaleString()}`);
      updated++;
    } else {
      notFoundList.push(productInfo.name);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`  ✅ Updated: ${updated} products`);
  console.log(`  ❌ Not found: ${notFound} products`);
  console.log(`  ⏭️  Skipped: ${skipped} lines`);
  
  if (notFoundList.length > 0 && notFoundList.length <= 20) {
    console.log('\n❌ Not found products:');
    notFoundList.forEach((name, idx) => {
      console.log(`   ${idx + 1}. ${name.substring(0, 60)}...`);
    });
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

updatePrices().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
