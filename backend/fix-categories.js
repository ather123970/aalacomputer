// Script to fix product categories in MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

// Product schema
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

// Category detection rules
function detectCategory(product) {
  const name = (product.name || product.title || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  // Headsets/Headphones
  if (name.includes('headset') || name.includes('headphone') || name.includes('earphone') || 
      name.includes('iem') || name.includes('ear monitor')) {
    return 'Headsets';
  }
  
  // Controllers/Gamepads
  if (name.includes('controller') || name.includes('gamepad') || name.includes('gaming controller') ||
      name.includes('wireless gaming controller')) {
    return 'Controllers';
  }
  
  // CPU Coolers
  if (name.includes('cooler') || name.includes('coreliquid') || name.includes('aio') ||
      name.includes('liquid cpu cooler') || name.includes('cpu cooler')) {
    return 'CPU Coolers';
  }
  
  // PC Cases
  if (name.includes('case') || name.includes('tower') || name.includes('gaming case') ||
      name.includes('pc case') || name.includes('mid-tower') || name.includes('mid tower')) {
    return 'PC Cases';
  }
  
  // Monitors
  if (name.includes('monitor') || name.includes('display') || 
      (name.includes('inch') && (name.includes('fhd') || name.includes('qhd') || name.includes('uhd') || name.includes('4k'))) ||
      name.includes('gaming monitor') || name.includes('smart monitor')) {
    return 'Monitors';
  }
  
  // Mouse/Mice
  if (name.includes('mouse') || name.includes('gaming mouse') || name.includes('wireless mouse')) {
    return 'Mice';
  }
  
  // Keyboards
  if (name.includes('keyboard') || name.includes('mechanical keyboard') || name.includes('gaming keyboard')) {
    return 'Keyboards';
  }
  
  // Processors/CPUs
  if (name.includes('ryzen') || name.includes('processor') || name.includes('cpu') ||
      name.includes('core i3') || name.includes('core i5') || name.includes('core i7') || name.includes('core i9') ||
      name.includes('core ultra') || (brand.includes('amd') && name.includes('7 ')) || (brand.includes('amd') && name.includes('5 '))) {
    // But NOT if it's a laptop
    if (name.includes('laptop') || name.includes('gaming laptop') || name.includes('notebook')) {
      return 'Laptops';
    }
    return 'Processors';
  }
  
  // Graphics Cards
  if (name.includes('rtx') || name.includes('gtx') || name.includes('geforce') || 
      name.includes('radeon') || name.includes('rx ') || name.includes('graphics card') ||
      name.includes('video card') || name.includes('gpu') ||
      name.includes('gddr7') || name.includes('gddr6')) {
    // But NOT if it's a laptop
    if (name.includes('laptop') || name.includes('gaming laptop') || name.includes('notebook')) {
      return 'Laptops';
    }
    return 'Graphics Cards';
  }
  
  // Laptops
  if (name.includes('laptop') || name.includes('notebook') || name.includes('zenbook') ||
      name.includes('elitebook') || name.includes('gaming laptop') || name.includes('predator') ||
      name.includes('nitro') || name.includes('helios')) {
    return 'Laptops';
  }
  
  // Motherboards
  if (name.includes('motherboard') || name.includes('mobo') || name.includes('mainboard') ||
      name.includes('x870') || name.includes('b850') || name.includes('z890') ||
      name.includes('x670') || name.includes('b650') || name.includes('z790')) {
    return 'Motherboards';
  }
  
  // RAM/Memory
  if (name.includes('ram') || name.includes('memory') || name.includes('ddr4') || name.includes('ddr5') ||
      name.includes('dimm') || name.includes('so-dimm')) {
    return 'RAM';
  }
  
  // Storage (SSD/HDD)
  if (name.includes('ssd') || name.includes('hdd') || name.includes('nvme') ||
      name.includes('portable ssd') || name.includes('hard drive') || name.includes('storage')) {
    return 'Storage';
  }
  
  // Power Supplies
  if (name.includes('power supply') || name.includes('psu') || name.includes('watt')) {
    return 'Power Supplies';
  }
  
  // Networking
  if (name.includes('router') || name.includes('wi-fi') || name.includes('wifi') ||
      name.includes('networking') || name.includes('network')) {
    return 'Networking';
  }
  
  // Printers
  if (name.includes('printer') || name.includes('ink tank') || name.includes('ecotank')) {
    return 'Printers';
  }
  
  // Accessories (cables, sleeves, backpacks, etc.)
  if (name.includes('cable') || name.includes('sleeve') || name.includes('backpack') ||
      name.includes('usb') || name.includes('adapter')) {
    return 'Cables & Accessories';
  }
  
  // If still unclear, return existing category or empty
  return category || '';
}

async function fixCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    let updated = 0;
    let unchanged = 0;

    for (const product of products) {
      const oldCategory = product.category || 'No Category';
      const newCategory = detectCategory(product);
      
      if (newCategory && newCategory !== oldCategory) {
        console.log(`📝 Updating: "${product.name}"`);
        console.log(`   Old: "${oldCategory}" → New: "${newCategory}"`);
        
        await Product.updateOne(
          { _id: product._id },
          { $set: { category: newCategory } }
        );
        updated++;
      } else {
        unchanged++;
      }
    }

    console.log(`\n✅ Category Fix Complete!`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Unchanged: ${unchanged} products`);
    console.log(`   Total: ${products.length} products`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the fix
fixCategories();
