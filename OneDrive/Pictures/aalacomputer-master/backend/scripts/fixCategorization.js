// Fix laptop categorization and image issues
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

function getProductModel() {
  const schema = new mongoose.Schema({}, { 
    strict: false, 
    timestamps: false,
    collection: 'products'
  });
  return mongoose.models.Product || mongoose.model('Product', schema);
}

// Detect if product is a laptop
function isLaptop(productName) {
  if (!productName) return false;
  
  const nameLower = productName.toLowerCase();
  
  // Laptop indicators
  const laptopKeywords = [
    'laptop', 'notebook', 'elitebook', 'thinkpad', 'precision',
    'inspiron', 'latitude', 'vostro', 'probook', 'pavilion',
    'zenbook', 'vivobook', 'tuf gaming', 'rog laptop', 'macbook',
    'chromebook', 'surface laptop', 'ideapad', 'legion laptop',
    'nitro laptop', 'aspire laptop', 'swift laptop'
  ];
  
  // Check for laptop keywords
  for (const keyword of laptopKeywords) {
    if (nameLower.includes(keyword)) {
      return true;
    }
  }
  
  // Check for laptop model patterns (brand + alphanumeric model)
  const laptopPatterns = [
    /acer\s+nitro\s+v/i,
    /acer\s+aspire/i,
    /hp\s+elite(book|display)/i,
    /dell\s+(latitude|precision|inspiron|xps)/i,
    /lenovo\s+(thinkpad|ideapad|legion)/i,
    /asus\s+(zenbook|vivobook|rog|tuf)/i,
    /msi\s+(gf|ge|gs|gt)\d+/i
  ];
  
  for (const pattern of laptopPatterns) {
    if (pattern.test(productName)) {
      return true;
    }
  }
  
  return false;
}

// Check if image URL is valid
function isValidImageUrl(url) {
  if (!url || url === '' || url === 'undefined' || url === 'null') {
    return false;
  }
  
  // Check if it's a valid URL format
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fixIssues() {
  console.log('🔧 Starting fixes...\n');
  
  const Product = getProductModel();
  
  try {
    // Issue 1: Move laptops from Processors (category_id: 1) to Prebuilt PCs (category_id: 15)
    console.log('📦 Finding laptops in Processor category...');
    
    const processorsWithLaptops = await Product.find({ 
      category_id: 1 
    }).lean();
    
    const laptopsToMove = processorsWithLaptops.filter(p => {
      const name = p.name || p.title || p.Name || '';
      return isLaptop(name);
    });
    
    console.log(`Found ${laptopsToMove.length} laptops to move from Processors\n`);
    
    // Move laptops to "Prebuilt PCs" category or create "Laptops" category
    if (laptopsToMove.length > 0) {
      const laptopUpdates = laptopsToMove.map(laptop => ({
        updateOne: {
          filter: { _id: laptop._id },
          update: { 
            $set: { 
              category_id: 15, // Prebuilt PCs
              category: 'Prebuilt PCs',
              categorySlug: 'prebuilts'
            } 
          }
        }
      }));
      
      const result = await Product.bulkWrite(laptopUpdates);
      console.log(`✅ Moved ${result.modifiedCount} laptops to Prebuilt PCs category\n`);
      
      // Show some examples
      console.log('📝 Moved laptops (examples):');
      laptopsToMove.slice(0, 10).forEach(laptop => {
        const name = laptop.name || laptop.title || laptop.Name || '';
        console.log(`   - ${name.substring(0, 60)}...`);
      });
      console.log('');
    }
    
    // Issue 2: Fix invalid image URLs
    console.log('🖼️  Checking for invalid image URLs...');
    
    const allProducts = await Product.find({}).lean();
    let invalidImageCount = 0;
    const imageUpdates = [];
    
    for (const product of allProducts) {
      let needsUpdate = false;
      const updateData = {};
      
      // Check img field
      if (!isValidImageUrl(product.img)) {
        // Try imageUrl as fallback
        if (isValidImageUrl(product.imageUrl)) {
          updateData.img = product.imageUrl;
          needsUpdate = true;
        } else if (isValidImageUrl(product.image)) {
          updateData.img = product.image;
          needsUpdate = true;
        } else {
          // Set to placeholder
          updateData.img = '/placeholder.png';
          needsUpdate = true;
          invalidImageCount++;
        }
      }
      
      // Check imageUrl field
      if (!isValidImageUrl(product.imageUrl)) {
        if (isValidImageUrl(product.img)) {
          updateData.imageUrl = product.img;
          needsUpdate = true;
        } else if (isValidImageUrl(product.image)) {
          updateData.imageUrl = product.image;
          needsUpdate = true;
        } else {
          updateData.imageUrl = '/placeholder.png';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        imageUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: updateData }
          }
        });
      }
    }
    
    if (imageUpdates.length > 0) {
      const result = await Product.bulkWrite(imageUpdates);
      console.log(`✅ Fixed ${result.modifiedCount} products with invalid images\n`);
      console.log(`⚠️  ${invalidImageCount} products had no valid image URLs (set to placeholder)\n`);
    } else {
      console.log('✅ All product images are valid\n');
    }
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 FIX SUMMARY');
    console.log('═══════════════════════════════════════');
    
    // Count products by category
    const processorCount = await Product.countDocuments({ category_id: 1 });
    const prebuiltCount = await Product.countDocuments({ category_id: 15 });
    
    console.log(`✅ Processors (category_id=1): ${processorCount} products`);
    console.log(`✅ Prebuilt PCs (category_id=15): ${prebuiltCount} products`);
    console.log(`✅ Laptops moved: ${laptopsToMove.length}`);
    console.log(`✅ Images fixed: ${imageUpdates.length}`);
    console.log('═══════════════════════════════════════\n');
    
    // Verify processors now only have Intel/AMD CPUs
    console.log('🔍 Verifying Processor category...');
    const remainingProcessors = await Product.find({ category_id: 1 }).lean().limit(10);
    console.log('First 10 products in Processor category:');
    remainingProcessors.forEach(p => {
      const name = p.name || p.title || p.Name || '';
      const brand = p.brand || 'No brand';
      console.log(`   - [${brand}] ${name.substring(0, 60)}...`);
    });
    
  } catch (err) {
    console.error('❌ Fix failed:', err);
    throw err;
  }
}

async function main() {
  try {
    await connectDB();
    await fixIssues();
    console.log('\n✅ All fixes completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fix failed:', err);
    process.exit(1);
  }
}

main();
