// Download laptop images locally to avoid timeout issues on production
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';

// Product schema (simplified)
const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

// Download image with timeout
function downloadImage(url, destPath, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const timeoutHandle = setTimeout(() => {
      reject(new Error('Download timeout'));
    }, timeout);

    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
        'Referer': url.includes('zahcomputers.pk') ? 'https://zahcomputers.pk/' : undefined
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        clearTimeout(timeoutHandle);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destPath);
      response.pipe(file);

      file.on('finish', () => {
        clearTimeout(timeoutHandle);
        file.close();
        resolve(destPath);
      });

      file.on('error', (err) => {
        clearTimeout(timeoutHandle);
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeoutHandle);
      reject(err);
    });
  });
}

// Sanitize filename
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .substring(0, 200) + '.jpg';
}

async function downloadLaptopImages() {
  try {
    console.log('🚀 Starting laptop image download...\n');
    await mongoose.connect(MONGO_URI);
    
    // Get all laptop products with external URLs
    const laptops = await Product.find({
      $or: [
        { category: /laptop/i },
        { name: /laptop/i },
        { Name: /laptop/i }
      ],
      $and: [
        {
          $or: [
            { img: /^https?:\/\// },
            { imageUrl: /^https?:\/\// }
          ]
        }
      ]
    })
    .select('id name Name title img imageUrl')
    .limit(50) // Download first 50 to test
    .lean();

    console.log(`Found ${laptops.length} laptops with external URLs\n`);
    
    const zahImagesPath = path.join(__dirname, '..', '..', 'zah_images');
    if (!fs.existsSync(zahImagesPath)) {
      fs.mkdirSync(zahImagesPath, { recursive: true });
    }

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < laptops.length; i++) {
      const laptop = laptops[i];
      const productName = laptop.Name || laptop.name || laptop.title;
      const imageUrl = laptop.img || laptop.imageUrl;
      
      console.log(`\n[${i + 1}/${laptops.length}] ${productName}`);
      console.log(`URL: ${imageUrl.substring(0, 80)}...`);
      
      const fileName = sanitizeFilename(productName);
      const destPath = path.join(zahImagesPath, fileName);
      
      // Skip if already exists
      if (fs.existsSync(destPath)) {
        console.log('⏭️  Already exists, skipping');
        skipped++;
        continue;
      }
      
      try {
        console.log(`⬇️  Downloading...`);
        await downloadImage(imageUrl, destPath, 30000);
        const stats = fs.statSync(destPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✅ Downloaded (${sizeMB} MB)`);
        downloaded++;
        
        // Update product in database to use local path
        await Product.updateOne(
          { _id: laptop._id },
          { $set: { img: `/images/${fileName}`, imageUrl: `/images/${fileName}` } }
        );
        console.log(`📝 Updated database to use local path`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`✅ Downloaded: ${downloaded}`);
    console.log(`⏭️  Skipped (already exist): ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(80));
    
    if (downloaded > 0) {
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Run: git add zah_images/');
      console.log('2. Run: git commit -m "Add local laptop images for faster loading"');
      console.log('3. Run: git push origin master');
      console.log('4. Wait for Render to redeploy');
      console.log('5. Laptop images will now load instantly from local files!');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

downloadLaptopImages();
