const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure mongoose timeouts BEFORE any operations
mongoose.set('bufferTimeoutMS', 60000); // 60 seconds buffer timeout
mongoose.set('bufferCommands', false); // Disable buffering

let Product; // Will be loaded after connection

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log('📡 Database:', mongoose.connection.name);
    
    // Load Product model AFTER connection is established
    Product = require('./backend/models/Product');
    console.log('✅ Product model loaded');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

// Parse the products without prices file
function parseProductsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const products = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Try different parsing patterns
    // Pattern 1: "Product Name Category: X Brand: Y Estimated Price: PKR Z"
    let match = line.match(/^(.+?)\s+Category:\s*(.+?)\s+Brand:\s*(.+?)\s+Estimated Price:\s*PKR\s*([\d,]+)/i);
    
    if (match) {
      products.push({
        name: match[1].trim(),
        category: match[2].trim(),
        brand: match[3].trim(),
        price: parseFloat(match[4].replace(/,/g, ''))
      });
      continue;
    }
    
    // Pattern 2: "#,Product Name,Category,Brand,Estimated Price (PKR)"
    match = line.match(/^\d+,(.+?),(.+?),(.+?),"?([\d,]+)"?$/);
    
    if (match) {
      products.push({
        name: match[1].trim(),
        category: match[2].trim(),
        brand: match[3].trim(),
        price: parseFloat(match[4].replace(/,/g, ''))
      });
      continue;
    }
    
    // Pattern 3: Tab-separated with number prefix
    match = line.match(/^(\d+)\s+(.+?)\s+([\w\s()]+)\s+([\w\s]+)\s+([\d,]+)$/);
    
    if (match) {
      products.push({
        name: match[2].trim(),
        category: match[3].trim(),
        brand: match[4].trim(),
        price: parseFloat(match[5].replace(/,/g, ''))
      });
      continue;
    }
  }
  
  return products;
}

// Normalize product name for matching
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Update products without prices
async function updateProductPrices() {
  try {
    console.log('📖 Reading products file...');
    const productsToUpdate = parseProductsFile(path.join(__dirname, 'PRODUCTS_WITHOUT_PRICES.txt'));
    console.log(`Found ${productsToUpdate.length} products with estimated prices\n`);
    
    // Get all products from database that have price 0 or no price
    console.log('🔍 Fetching products without prices from database...');
    console.log('⏳ This may take a moment for large collections...\n');
    
    const dbProducts = await Product.find({
      $or: [
        { price: 0 },
        { price: null },
        { price: { $exists: false } }
      ]
    })
    .select('_id Name name title category brand')
    .lean()
    .maxTimeMS(60000); // 60 second timeout for this query
    
    console.log(`Found ${dbProducts.length} products without prices in database\n`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    const updateLog = [];
    
    console.log('🔄 Starting price updates...\n');
    
    for (const productData of productsToUpdate) {
      const normalizedName = normalizeProductName(productData.name);
      
      // Try to find matching product in database
      const dbProduct = dbProducts.find(p => {
        const dbName = normalizeProductName(p.Name || p.name || p.title || '');
        return dbName === normalizedName || dbName.includes(normalizedName) || normalizedName.includes(dbName);
      });
      
      if (dbProduct) {
        try {
          // Update the product price
          await Product.updateOne(
            { _id: dbProduct._id },
            { 
              $set: { 
                price: productData.price,
                updatedAt: new Date()
              } 
            }
          );
          
          updatedCount++;
          const logEntry = `✅ Updated: "${productData.name}" → PKR ${productData.price.toLocaleString()}`;
          console.log(logEntry);
          updateLog.push(logEntry);
        } catch (error) {
          const errorEntry = `❌ Error updating "${productData.name}": ${error.message}`;
          console.error(errorEntry);
          updateLog.push(errorEntry);
        }
      } else {
        notFoundCount++;
        const notFoundEntry = `⚠️  Not found in DB: "${productData.name}" (PKR ${productData.price.toLocaleString()})`;
        console.log(notFoundEntry);
        updateLog.push(notFoundEntry);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`⚠️  Not found in database: ${notFoundCount} products`);
    console.log(`📝 Total processed: ${productsToUpdate.length} products`);
    console.log('='.repeat(60) + '\n');
    
    // Save update log to file
    const logPath = path.join(__dirname, 'price-update-log.txt');
    fs.writeFileSync(logPath, updateLog.join('\n'), 'utf-8');
    console.log(`📄 Detailed log saved to: ${logPath}`);
    
  } catch (error) {
    console.error('❌ Error during price update:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Product Price Update Script');
  console.log('='.repeat(60) + '\n');
  
  await connectDB();
  await updateProductPrices();
  
  console.log('\n✅ Price update completed!');
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
