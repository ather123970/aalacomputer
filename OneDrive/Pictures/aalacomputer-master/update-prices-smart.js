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

// Calculate similarity score between two strings (simple algorithm)
function calculateSimilarity(str1, str2) {
  const norm1 = normalizeProductName(str1);
  const norm2 = normalizeProductName(str2);
  
  // Exact match
  if (norm1 === norm2) return 1.0;
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.9;
  }
  
  // Calculate word overlap
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length > 2 && words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matchCount++;
    }
  }
  
  const maxWords = Math.max(words1.length, words2.length);
  return matchCount / maxWords;
}

// Find best matching product from database
function findBestMatch(productData, dbProducts) {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const dbProduct of dbProducts) {
    const dbName = dbProduct.Name || dbProduct.name || dbProduct.title || '';
    const dbBrand = (dbProduct.brand || '').toLowerCase();
    const productBrand = (productData.brand || '').toLowerCase();
    
    // Calculate name similarity
    let score = calculateSimilarity(productData.name, dbName);
    
    // Boost score if brands match
    if (dbBrand && productBrand && dbBrand.includes(productBrand.substring(0, 3))) {
      score += 0.2;
    }
    
    // Update best match if this score is better
    if (score > bestScore) {
      bestScore = score;
      bestMatch = dbProduct;
    }
  }
  
  // Only return match if similarity is above threshold
  return bestScore >= 0.5 ? { product: bestMatch, score: bestScore } : null;
}

async function updatePricesWithSmartMatching() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
  });

  try {
    console.log('🚀 Starting Smart Product Price Update');
    console.log('='.repeat(80) + '\n');
    
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('aalacomputer');
    const productsCollection = db.collection('products');

    console.log('📖 Reading products file...');
    const productsToUpdate = parseProductsFile(path.join(__dirname, 'PRODUCTS_WITHOUT_PRICES.txt'));
    console.log(`Found ${productsToUpdate.length} products with estimated prices\n`);

    console.log('🔍 Fetching products without prices from database...');
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
    const matchScores = [];

    console.log('🔄 Starting smart price matching...\n');
    console.log('='.repeat(80));

    for (const productData of productsToUpdate) {
      const match = findBestMatch(productData, dbProducts);

      if (match) {
        const dbProduct = match.product;
        const score = match.score;
        
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
          const dbName = dbProduct.Name || dbProduct.name || dbProduct.title;
          const logEntry = `✅ [${(score * 100).toFixed(0)}%] "${productData.name}" → "${dbName}" = PKR ${productData.price.toLocaleString()}`;
          console.log(logEntry);
          updateLog.push(logEntry);
          matchScores.push(score);
        } catch (error) {
          const errorEntry = `❌ Error updating "${productData.name}": ${error.message}`;
          console.error(errorEntry);
          updateLog.push(errorEntry);
        }
      } else {
        notFoundCount++;
        const notFoundEntry = `⚠️  No match: "${productData.name}" (PKR ${productData.price.toLocaleString()})`;
        console.log(notFoundEntry);
        updateLog.push(notFoundEntry);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📊 UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`⚠️  Not found: ${notFoundCount} products`);
    console.log(`📝 Total processed: ${productsToUpdate.length} products`);
    
    if (matchScores.length > 0) {
      const avgScore = matchScores.reduce((a, b) => a + b, 0) / matchScores.length;
      console.log(`📈 Average match confidence: ${(avgScore * 100).toFixed(1)}%`);
    }
    
    console.log('='.repeat(80) + '\n');

    // Save update log to file
    const logPath = path.join(__dirname, 'smart-price-update-log.txt');
    fs.writeFileSync(logPath, updateLog.join('\n'), 'utf-8');
    console.log(`📄 Detailed log saved to: ${logPath}`);

    console.log('\n✅ Smart price update completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Database connection closed');
  }
}

updatePricesWithSmartMatching();
