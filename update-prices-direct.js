const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

async function updatePrices() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
  });

  try {
    console.log('🚀 Starting Product Price Update Script');
    console.log('='.repeat(60) + '\n');
    
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('aalacomputer');
    const productsCollection = db.collection('products');

    // Test connection
    const totalCount = await productsCollection.countDocuments();
    console.log(`📊 Total products in database: ${totalCount}\n`);

    console.log('📖 Reading products file...');
    const productsToUpdate = parseProductsFile(path.join(__dirname, 'PRODUCTS_WITHOUT_PRICES.txt'));
    console.log(`Found ${productsToUpdate.length} products with estimated prices\n`);

    console.log('🔍 Fetching products without prices from database...');
    
    // Fetch products without prices
    const dbProducts = await productsCollection
      .find({
        $or: [
          { price: 0 },
          { price: null },
          { price: { $exists: false } }
        ]
      })
      .project({ _id: 1, Name: 1, name: 1, title: 1, category: 1, brand: 1 })
      .toArray();

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
          await productsCollection.updateOne(
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

    console.log('\n✅ Price update completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Database connection closed');
  }
}

updatePrices();
