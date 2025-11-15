const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const imagesDir = path.join(__dirname, 'zah_images');

// Function to normalize filename for comparison
function normalizeForComparison(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric
}

// Function to find matching image file
function findMatchingImage(productName, imageFiles, imageMap) {
  // First try exact match from current img field
  const currentImgName = productName.replace('/images/', '').replace(/^\//, '');
  if (imageMap.has(normalizeForComparison(currentImgName))) {
    return imageMap.get(normalizeForComparison(currentImgName));
  }
  
  // Try to find by product name
  const normalizedProductName = normalizeForComparison(productName);
  
  for (const [normalized, actualFile] of imageMap.entries()) {
    if (normalized.includes(normalizedProductName.substring(0, 20)) || 
        normalizedProductName.includes(normalized.substring(0, 20))) {
      return actualFile;
    }
  }
  
  return null;
}

async function fixImageUrls() {
  console.log('🔧 Starting image URL fix...\n');
  
  // Read all image files
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
  
  console.log(`📁 Found ${imageFiles.length} images in zah_images folder\n`);
  
  // Create a map of normalized names to actual filenames
  const imageMap = new Map();
  imageFiles.forEach(file => {
    const normalized = normalizeForComparison(file.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''));
    imageMap.set(normalized, file);
  });
  
  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('aalacomputer');
    const collection = db.collection('products');
    
    // Get all products
    const products = await collection.find({}).toArray();
    console.log(`📦 Found ${products.length} products in database\n`);
    
    let updated = 0;
    let notFound = 0;
    const notFoundList = [];
    
    for (const product of products) {
      const productName = product.name || product.title || product.Name || '';
      const currentImg = product.img || product.imageUrl || '';
      
      // Try to find matching image
      let matchedImage = null;
      
      // Method 1: Try current img filename
      if (currentImg) {
        const imgFilename = currentImg.replace('/images/', '').replace(/^\//, '');
        const normalized = normalizeForComparison(imgFilename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''));
        matchedImage = imageMap.get(normalized);
      }
      
      // Method 2: Try product name
      if (!matchedImage) {
        const normalizedName = normalizeForComparison(productName);
        for (const [normalized, actualFile] of imageMap.entries()) {
          if (normalized === normalizedName || 
              normalized.startsWith(normalizedName.substring(0, 30)) ||
              normalizedName.startsWith(normalized.substring(0, 30))) {
            matchedImage = actualFile;
            break;
          }
        }
      }
      
      if (matchedImage) {
        const newUrl = `/images/${matchedImage}`;
        if (currentImg !== newUrl) {
          await collection.updateOne(
            { _id: product._id },
            { 
              $set: { 
                img: newUrl,
                imageUrl: newUrl 
              } 
            }
          );
          updated++;
          console.log(`✅ Updated: ${productName.substring(0, 50)} -> ${matchedImage.substring(0, 50)}`);
        }
      } else {
        notFound++;
        notFoundList.push(productName);
        console.log(`❌ No match: ${productName.substring(0, 50)}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Updated: ${updated} products`);
    console.log(`❌ Not found: ${notFound} products`);
    console.log('='.repeat(60));
    
    if (notFoundList.length > 0 && notFoundList.length <= 20) {
      console.log('\n📋 Products without matching images:');
      notFoundList.forEach(name => console.log(`  - ${name}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Database connection closed');
  }
}

fixImageUrls();
