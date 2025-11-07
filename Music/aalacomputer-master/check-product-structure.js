const mongoose = require('mongoose');

// Product Schema
const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);

async function checkStructure() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Get sample products to see structure
    const sampleProducts = await Product.find({}).limit(10).lean();
    
    console.log('\n📦 SAMPLE PRODUCT STRUCTURES:');
    sampleProducts.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1} ---`);
      console.log('Keys:', Object.keys(product));
      console.log('Name/Title:', product.name || product.title);
      console.log('Category:', product.category);
      console.log('Brand:', product.brand);
      
      // Check if category info is in name/title
      const nameTitle = (product.name || product.title || '').toLowerCase();
      console.log('Name contains HP?', nameTitle.includes('hp'));
      console.log('Name contains laptop?', nameTitle.includes('laptop'));
      console.log('Name contains probook?', nameTitle.includes('probook'));
    });

    // Try to extract categories from product names
    console.log('\n🔍 EXTRACTING CATEGORIES FROM NAMES:');
    const allProducts = await Product.find({}).select('name title').lean();
    
    const categoryKeywords = new Set();
    const brandKeywords = new Set();
    
    allProducts.forEach(product => {
      const text = (product.name || product.title || '').toLowerCase();
      
      // Extract potential categories
      if (text.includes('laptop') || text.includes('notebook')) categoryKeywords.add('Laptops');
      if (text.includes('monitor') || text.includes('display')) categoryKeywords.add('Monitors');
      if (text.includes('keyboard')) categoryKeywords.add('Keyboards');
      if (text.includes('mouse')) categoryKeywords.add('Mice');
      if (text.includes('headset') || text.includes('headphone')) categoryKeywords.add('Audio');
      if (text.includes('ssd') || text.includes('hard drive') || text.includes('storage')) categoryKeywords.add('Storage');
      if (text.includes('ram') || text.includes('memory')) categoryKeywords.add('Memory');
      if (text.includes('processor') || text.includes('cpu')) categoryKeywords.add('Processors');
      if (text.includes('graphics') || text.includes('gpu') || text.includes('video card')) categoryKeywords.add('Graphics Cards');
      if (text.includes('motherboard') || text.includes('mainboard')) categoryKeywords.add('Motherboards');
      if (text.includes('power supply') || text.includes('psu')) categoryKeywords.add('Power Supplies');
      if (text.includes('case') || text.includes('chassis')) categoryKeywords.add('Cases');
      if (text.includes('cooler') || text.includes('cooling')) categoryKeywords.add('Cooling');
      if (text.includes('cable') || text.includes('adapter')) categoryKeywords.add('Cables & Adapters');
      
      // Extract potential brands
      if (text.includes('hp ') || text.startsWith('hp ')) brandKeywords.add('HP');
      if (text.includes('dell ') || text.startsWith('dell ')) brandKeywords.add('Dell');
      if (text.includes('lenovo ') || text.startsWith('lenovo ')) brandKeywords.add('Lenovo');
      if (text.includes('asus ') || text.startsWith('asus ')) brandKeywords.add('ASUS');
      if (text.includes('acer ') || text.startsWith('acer ')) brandKeywords.add('Acer');
      if (text.includes('msi ') || text.startsWith('msi ')) brandKeywords.add('MSI');
      if (text.includes('apple ') || text.startsWith('apple ')) brandKeywords.add('Apple');
      if (text.includes('samsung ') || text.startsWith('samsung ')) brandKeywords.add('Samsung');
      if (text.includes('lg ') || text.startsWith('lg ')) brandKeywords.add('LG');
      if (text.includes('sony ') || text.startsWith('sony ')) brandKeywords.add('Sony');
      if (text.includes('intel ') || text.startsWith('intel ')) brandKeywords.add('Intel');
      if (text.includes('amd ') || text.startsWith('amd ')) brandKeywords.add('AMD');
      if (text.includes('nvidia ') || text.startsWith('nvidia ')) brandKeywords.add('NVIDIA');
      if (text.includes('corsair ') || text.startsWith('corsair ')) brandKeywords.add('Corsair');
      if (text.includes('logitech ') || text.startsWith('logitech ')) brandKeywords.add('Logitech');
      if (text.includes('razer ') || text.startsWith('razer ')) brandKeywords.add('Razer');
      if (text.includes('steelseries ') || text.startsWith('steelseries ')) brandKeywords.add('SteelSeries');
    });

    console.log('\nDetected Categories:', Array.from(categoryKeywords).sort());
    console.log('Detected Brands:', Array.from(brandKeywords).sort());

    // Count products by detected categories
    console.log('\n📊 PRODUCT COUNTS BY CATEGORY:');
    for (const category of Array.from(categoryKeywords).sort()) {
      let count = 0;
      const keyword = category.toLowerCase();
      
      if (keyword.includes('laptop')) {
        count = await Product.countDocuments({
          $or: [
            { name: { $regex: 'laptop|notebook', $options: 'i' } },
            { title: { $regex: 'laptop|notebook', $options: 'i' } }
          ]
        });
      } else if (keyword.includes('monitor')) {
        count = await Product.countDocuments({
          $or: [
            { name: { $regex: 'monitor|display', $options: 'i' } },
            { title: { $regex: 'monitor|display', $options: 'i' } }
          ]
        });
      }
      // Add more specific counts as needed
      
      console.log(`${category}: ${count} products`);
    }

  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkStructure().catch(console.error);
