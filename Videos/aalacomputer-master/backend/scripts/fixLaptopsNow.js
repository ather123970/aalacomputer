/**
 * IMMEDIATE FIX: Remove non-laptops from Laptops category
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

async function fixLaptopsNow() {
  console.log('\n🚀 FIXING LAPTOPS CATEGORY NOW\n');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');
  
  // Get all products in Laptops category
  const laptopProducts = await Product.find({ 
    category: /laptop/i 
  }).lean();
  
  console.log(`Found ${laptopProducts.length} products in Laptops category\n`);
  
  let fixed = 0;
  
  for (const product of laptopProducts) {
    const name = (product.name || product.Name || product.title || '').toLowerCase();
    let newCategory = null;
    let newSlug = null;
    
    // Check for monitors (MUST NOT have "laptop" keyword)
    if ((name.includes('monitor') || name.includes('display')) && 
        !name.includes('laptop') && !name.includes('notebook')) {
      newCategory = 'Monitors';
      newSlug = 'monitors';
    }
    // Check for headsets/headphones
    else if (name.includes('headset') || name.includes('headphone') || 
             name.includes('gaming headset') || name.includes('cloud ii') ||
             name.includes('cloud stinger') || name.includes('cloud revolver')) {
      newCategory = 'Headsets';
      newSlug = 'headsets';
    }
    // Check for RAM (laptop RAM should stay, but check for keywords)
    else if ((name.includes('ddr4') || name.includes('ddr5') || name.includes('sodimm') || 
              name.includes('memory module') || name.includes('ram')) && 
             !name.includes('laptop') && !name.includes('notebook')) {
      newCategory = 'RAM';
      newSlug = 'ram';
    }
    // Check for trackpad/mouse
    else if (name.includes('trackpad') || name.includes('magic trackpad')) {
      newCategory = 'Mouse';
      newSlug = 'mouse';
    }
    
    // Update if category needs changing
    if (newCategory) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { category: newCategory, categorySlug: newSlug } }
      );
      
      console.log(`✅ "${name.substring(0, 70)}..." → ${newCategory}`);
      fixed++;
    }
  }
  
  console.log(`\n📊 Fixed ${fixed} products\n`);
  
  // Now check PC Cases category
  console.log('🔍 Checking PC Cases category...\n');
  
  const cases = await Product.find({
    category: /case/i
  }).lean();
  
  console.log(`Found ${cases.length} products in Cases category`);
  
  // Look for products that should be in Cases but aren't
  const shouldBeCases = await Product.find({
    $or: [
      { name: /pc case/i },
      { name: /gaming case/i },
      { name: /tower/i },
      { name: /cabinet/i },
      { name: /atx.*case/i },
      { title: /pc case/i },
      { title: /gaming case/i }
    ],
    category: { $not: /case/i }
  }).lean();
  
  console.log(`\nFound ${shouldBeCases.length} products that should be in Cases`);
  
  for (const product of shouldBeCases) {
    const name = (product.name || product.Name || product.title || '').toLowerCase();
    
    // Make sure it's actually a case, not a laptop case or phone case
    if (!name.includes('laptop') && !name.includes('phone') && !name.includes('mobile')) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { category: 'Cases', categorySlug: 'cases' } }
      );
      
      console.log(`✅ "${name.substring(0, 70)}..." → Cases`);
    }
  }
  
  await mongoose.connection.close();
  console.log('\n✅ Done!\n');
}

fixLaptopsNow();
