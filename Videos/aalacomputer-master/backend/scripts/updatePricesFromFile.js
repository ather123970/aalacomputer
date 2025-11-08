/**
 * UPDATE PRICES FROM FILE
 * Reads the PRODUCTS_WITHOUT_PRICES.txt file and updates database
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
  
  // Remove "PKR", "Rs.", commas, quotes, and any other non-numeric characters except decimal point
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
  // Try multiple formats
  
  // Format 1: "Product Name Category: X Brand: Y Estimated Price: PKR X"
  const format1Match = line.match(/^(.+?)\s+Category:\s+(.+?)\s+Brand:\s+(.+?)\s+(?:Estimated Price:\s*)?(?:PKR|Rs\.?)\s*([\d,]+)/i);
  if (format1Match) {
    return {
      name: format1Match[1].trim(),
      category: format1Match[2].trim(),
      brand: format1Match[3].trim(),
      price: parsePrice(format1Match[4])
    };
  }
  
  // Format 2: Tab-separated "Number\tProduct Name\tCategory\tBrand\tPrice"
  const tabParts = line.split('\t');
  if (tabParts.length >= 5) {
    return {
      name: tabParts[1].trim(),
      category: tabParts[2].trim(),
      brand: tabParts[3].trim(),
      price: parsePrice(tabParts[4])
    };
  }
  
  // Format 3: Comma-separated with quotes
  const csvMatch = line.match(/^\d+,(.+?),(.+?),(.+?),"?([\d,]+)"?/);
  if (csvMatch) {
    return {
      name: csvMatch[1].trim().replace(/^"|"$/g, ''),
      category: csvMatch[2].trim(),
      brand: csvMatch[3].trim(),
      price: parsePrice(csvMatch[4])
    };
  }
  
  // Format 4: Simple comma-separated
  const parts = line.split(',');
  if (parts.length >= 4) {
    return {
      name: parts[0].replace(/^\d+\.?\s*/, '').trim(),
      category: parts[1].trim(),
      brand: parts[2].trim(),
      price: parsePrice(parts[3])
    };
  }
  
  return null;
}

async function updatePrices() {
  console.log('\n💰 UPDATING PRICES FROM FILE\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');
  
  const filePath = path.join(__dirname, '..', '..', 'PRODUCTS_WITHOUT_PRICES.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let updated = 0;
  let notFound = 0;
  let skipped = 0;
  
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
    
    // Try to find the product in database
    const query = {
      $or: [
        { name: new RegExp(productInfo.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { Name: new RegExp(productInfo.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { title: new RegExp(productInfo.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
      ]
    };
    
    const product = await Product.findOne(query);
    
    if (product) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { price: productInfo.price, Price: productInfo.price } }
      );
      
      console.log(`✅ Updated: ${productInfo.name.substring(0, 60)}... → PKR ${productInfo.price.toLocaleString()}`);
      updated++;
    } else {
      console.log(`❌ Not found: ${productInfo.name.substring(0, 60)}...`);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`  ✅ Updated: ${updated} products`);
  console.log(`  ❌ Not found: ${notFound} products`);
  console.log(`  ⏭️  Skipped: ${skipped} lines`);
  console.log('\n' + '='.repeat(70) + '\n');
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

updatePrices().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
