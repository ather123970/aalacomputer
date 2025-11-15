const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB
const Product = require('../models/Product');

// Get all local image files
const zahImagesPath = path.join(__dirname, '../../zah_images');
const localImages = fs.readdirSync(zahImagesPath).filter(file => 
  file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
);

console.log(`📁 Found ${localImages.length} local images in zah_images/`);

// Function to normalize text for matching
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Function to find best matching image for a product
function findMatchingImage(productName) {
  if (!productName) return null;
  
  const normalizedProductName = normalizeText(productName);
  
  // Try exact match first (ignoring extension)
  for (const img of localImages) {
    const imgNameWithoutExt = img.replace(/\.(jpg|jpeg|png)$/i, '');
    const normalizedImgName = normalizeText(imgNameWithoutExt);
    
    // Exact match
    if (normalizedImgName === normalizedProductName) {
      return img;
    }
  }
  
  // Try partial match (product name contains image name or vice versa)
  for (const img of localImages) {
    const imgNameWithoutExt = img.replace(/\.(jpg|jpeg|png)$/i, '');
    const normalizedImgName = normalizeText(imgNameWithoutExt);
    
    // Check if product name includes significant part of image name
    const imgWords = normalizedImgName.split(' ').filter(w => w.length > 3);
    const productWords = normalizedProductName.split(' ').filter(w => w.length > 3);
    
    // If at least 60% of significant words match
    const matchingWords = imgWords.filter(word => 
      productWords.some(pw => pw.includes(word) || word.includes(pw))
    );
    
    if (matchingWords.length >= Math.floor(imgWords.length * 0.6)) {
      return img;
    }
  }
  
  return null;
}

async function fixImagePaths() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all products with external images
    const products = await Product.find({
      $or: [
        { img: { $regex: '^https?://' } },
        { imageUrl: { $regex: '^https?://' } },
        { image: { $regex: '^https?://' } }
      ]
    });

    console.log(`📦 Found ${products.length} products with external image URLs\n`);

    let updated = 0;
    let matched = 0;
    let notMatched = 0;

    for (const product of products) {
      const productName = product.Name || product.name || product.title;
      
      // Try to find matching local image
      const matchingImage = findMatchingImage(productName);
      
      if (matchingImage) {
        const localPath = `/images/${matchingImage}`;
        
        // Update all image fields
        product.img = localPath;
        product.imageUrl = localPath;
        product.image = localPath;
        
        await product.save();
        
        matched++;
        console.log(`✅ [${matched}/${products.length}] ${productName}`);
        console.log(`   → ${matchingImage}\n`);
      } else {
        notMatched++;
        console.log(`⚠️  [${matched + notMatched}/${products.length}] No match: ${productName}`);
      }
      
      updated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Products matched: ${matched}`);
    console.log(`⚠️  Products not matched: ${notMatched}`);
    console.log(`📁 Total local images: ${localImages.length}`);
    console.log('='.repeat(60));

    // Show some unmatched products for manual review
    if (notMatched > 0) {
      console.log('\n🔍 Sample of unmatched products:');
      const unmatchedProducts = await Product.find({
        $or: [
          { img: { $regex: '^https?://' } },
          { imageUrl: { $regex: '^https?://' } }
        ]
      }).limit(10);
      
      unmatchedProducts.forEach(p => {
        const name = p.Name || p.name || p.title;
        console.log(`   - ${name}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the fix
fixImagePaths();
