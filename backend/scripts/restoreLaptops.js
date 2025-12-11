/**
 * RESTORE ACTUAL LAPTOPS
 * Bring back real laptop products that were mistakenly moved
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String,
  Name: String,
  title: String,
  category: String,
  categorySlug: String,
  brand: String
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

// These are ACTUAL laptop indicators
const LAPTOP_INDICATORS = [
  // Laptop model patterns
  'gaming laptop',
  'business laptop',
  'ultrabook',
  'chromebook',
  'macbook pro',
  'macbook air',
  
  // Laptop series with processors
  'laptop.*core i',
  'laptop.*ryzen',
  'laptop.*intel',
  'laptop.*amd',
  
  // HP laptop models
  'hp omen.*laptop',
  'hp victus.*laptop',
  'hp elitebook',
  'hp probook',
  'hp pavilion.*laptop',
  'hp spectre',
  'hp envy.*laptop',
  'hp 15.*laptop',
  'hp 14.*laptop',
  'hp zbook',
  'hp omnibook',
  
  // Dell laptop models
  'dell xps.*laptop',
  'dell inspiron.*laptop',
  'dell latitude',
  'dell precision.*laptop',
  'dell alienware.*laptop',
  
  // Lenovo laptop models
  'lenovo thinkpad',
  'lenovo ideapad',
  'lenovo yoga',
  'lenovo legion.*laptop',
  'lenovo loq.*laptop',
  'thinkbook',
  
  // ASUS laptop models
  'asus rog.*laptop',
  'asus tuf.*laptop',
  'asus vivobook',
  'asus zenbook',
  'asus expertbook',
  
  // Acer laptop models
  'acer aspire.*laptop',
  'acer nitro.*laptop',
  'acer predator.*laptop',
  'acer swift',
  
  // MSI laptop models
  'msi.*gaming laptop',
  'msi katana',
  'msi raider',
  'msi gf series',
  
  // Specific indicators
  'fhd.*laptop',
  'touchscreen.*laptop',
  'backlit kb.*laptop',
  '15.6".*laptop',
  '14".*laptop',
  '16".*laptop',
  '13".*laptop',
  'geforce.*laptop',
  'rtx.*laptop'
];

// These are NOT laptops - accessories
const NOT_LAPTOP_ACCESSORIES = [
  'laptop sleeve',
  'laptop bag',
  'laptop case',
  'laptop stand',
  'laptop holder',
  'laptop backpack',
  'laptop cooler',
  'laptop cooling',
  'laptop riser',
  'for laptop',
  'usb.*hub',
  'multiport',
  'macbook case',
  'shield case',
  'minimalist laptop',
  'commuter bag',
  'cozy classic',
  'laptop adapter',
  'laptop charger'
];

async function restoreLaptops() {
  console.log('\n🔧 RESTORING ACTUAL LAPTOPS\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');
  
  // Find products that are NOT in Laptops but should be
  const allProducts = await Product.find({
    category: { $not: /laptop/i }
  }).lean();
  
  console.log(`Scanning ${allProducts.length} non-laptop products...\n`);
  
  let restored = 0;
  
  for (const product of allProducts) {
    const name = (product.name || product.Name || product.title || '').toLowerCase();
    
    // Check if this is a laptop accessory (should NOT be restored)
    const isAccessory = NOT_LAPTOP_ACCESSORIES.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(name);
    });
    
    if (isAccessory) {
      continue; // Skip accessories
    }
    
    // Check if this is an actual laptop
    const isLaptop = LAPTOP_INDICATORS.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(name);
    });
    
    if (isLaptop) {
      // This is a real laptop, restore it!
      await Product.updateOne(
        { _id: product._id },
        { $set: { category: 'Laptops', categorySlug: 'laptops' } }
      );
      
      console.log(`✅ RESTORED: "${name.substring(0, 70)}..."`);
      restored++;
    }
  }
  
  console.log(`\n📊 Restored ${restored} laptops back to Laptops category\n`);
  
  // Count final laptops
  const finalCount = await Product.countDocuments({ category: /laptop/i });
  console.log(`📱 Total laptops in category now: ${finalCount}\n`);
  
  await mongoose.connection.close();
  console.log('✅ Done!\n');
}

restoreLaptops();
