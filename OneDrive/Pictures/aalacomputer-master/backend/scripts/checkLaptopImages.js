// Check laptop product images in database
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aalacomputer';

// Product schema (simplified)
const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function checkLaptopImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!\n');

    // Find laptop products
    const laptops = await Product.find({
      $or: [
        { category: /laptop/i },
        { name: /laptop/i },
        { Name: /laptop/i },
        { title: /laptop/i }
      ]
    })
    .select('id name Name title category img imageUrl image images')
    .limit(10)
    .lean();

    console.log(`Found ${laptops.length} laptop products\n`);
    console.log('='.repeat(80));

    laptops.forEach((laptop, index) => {
      console.log(`\n${index + 1}. ${laptop.Name || laptop.name || laptop.title || 'Unnamed'}`);
      console.log('   Category:', laptop.category);
      console.log('   ID:', laptop.id || laptop._id);
      console.log('   img:', laptop.img || 'NONE');
      console.log('   imageUrl:', laptop.imageUrl || 'NONE');
      console.log('   image:', laptop.image || 'NONE');
      console.log('   images:', laptop.images ? JSON.stringify(laptop.images) : 'NONE');
      
      // Check if ANY image field exists
      const hasImage = laptop.img || laptop.imageUrl || laptop.image || 
                       (laptop.images && laptop.images.length > 0);
      
      if (!hasImage) {
        console.log('   ❌ NO IMAGE DATA FOUND!');
      } else {
        const imageUrl = laptop.img || laptop.imageUrl || laptop.image || 
                        (laptop.images && laptop.images[0] && (laptop.images[0].url || laptop.images[0]));
        
        if (imageUrl && imageUrl.startsWith('http')) {
          console.log('   🌐 EXTERNAL URL');
        } else if (imageUrl) {
          console.log('   📁 LOCAL PATH');
        }
      }
    });

    console.log('\n' + '='.repeat(80));
    
    // Now check graphics cards for comparison
    console.log('\n\nCOMPARISON: Graphics Cards (working category)');
    console.log('='.repeat(80));
    
    const graphics = await Product.find({
      $or: [
        { category: /graphics/i },
        { name: /graphics/i },
        { Name: /graphics/i }
      ]
    })
    .select('id name Name title category img imageUrl image')
    .limit(5)
    .lean();

    console.log(`\nFound ${graphics.length} graphics card products\n`);

    graphics.forEach((gpu, index) => {
      console.log(`\n${index + 1}. ${gpu.Name || gpu.name || gpu.title || 'Unnamed'}`);
      console.log('   img:', gpu.img || 'NONE');
      console.log('   imageUrl:', gpu.imageUrl || 'NONE');
      
      const imageUrl = gpu.img || gpu.imageUrl || gpu.image;
      if (imageUrl && imageUrl.startsWith('http')) {
        console.log('   🌐 EXTERNAL URL');
      } else if (imageUrl) {
        console.log('   📁 LOCAL PATH');
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\nSUMMARY:');
    console.log('- If laptops have NO IMAGE DATA → Need to add images to database');
    console.log('- If laptops have EXTERNAL URLs → Should work with our proxy');
    console.log('- If laptops have LOCAL PATHS → Check if files exist in zah_images/');
    console.log('='.repeat(80));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

checkLaptopImages();
