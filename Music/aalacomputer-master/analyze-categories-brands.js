const mongoose = require('mongoose');
const fs = require('fs');

// Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: String, index: true, unique: true },
  brand: { type: String, default: '' },
  name: String,
  title: String,
  price: { type: Number, default: 0 },
  img: String,
  imageUrl: String,
  description: String,
  category: String,
  WARRANTY: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: false,
  strict: false
});

const Product = mongoose.model('Product', ProductSchema);

async function analyzeData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!');

    // Get all unique categories
    const categories = await Product.distinct('category');
    const cleanCategories = categories
      .filter(cat => cat && cat.trim() !== '')
      .map(cat => cat.trim())
      .sort();

    console.log(`\n📁 CATEGORIES (${cleanCategories.length} total):`);
    cleanCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`);
    });

    // Get all unique brands
    const brands = await Product.distinct('brand');
    const cleanBrands = brands
      .filter(brand => brand && brand.trim() !== '')
      .map(brand => brand.trim())
      .sort();

    console.log(`\n🏢 BRANDS (${cleanBrands.length} total):`);
    cleanBrands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand}`);
    });

    // Get category-brand combinations
    console.log('\n🔗 CATEGORY-BRAND COMBINATIONS:');
    const categoryBrandMap = {};
    
    for (const category of cleanCategories.slice(0, 10)) { // Top 10 categories
      const brandsInCategory = await Product.distinct('brand', { 
        category: category,
        brand: { $exists: true, $ne: '' }
      });
      
      const cleanBrandsInCategory = brandsInCategory
        .filter(brand => brand && brand.trim() !== '')
        .map(brand => brand.trim())
        .sort();
      
      categoryBrandMap[category] = cleanBrandsInCategory;
      console.log(`\n${category} (${cleanBrandsInCategory.length} brands):`);
      cleanBrandsInCategory.slice(0, 5).forEach(brand => {
        console.log(`  - ${brand}`);
      });
      if (cleanBrandsInCategory.length > 5) {
        console.log(`  ... and ${cleanBrandsInCategory.length - 5} more`);
      }
    }

    // Sample products for each major category
    console.log('\n📦 SAMPLE PRODUCTS BY CATEGORY:');
    for (const category of cleanCategories.slice(0, 5)) {
      const sampleProducts = await Product.find({ category })
        .select('name title brand price')
        .limit(3);
      
      console.log(`\n${category}:`);
      sampleProducts.forEach(product => {
        console.log(`  - ${product.name || product.title} (${product.brand || 'No Brand'}) - PKR ${product.price}`);
      });
    }

    // Save data to files for frontend use
    const categoryData = {
      categories: cleanCategories,
      brands: cleanBrands,
      categoryBrandMap: categoryBrandMap,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync('category-brand-data.json', JSON.stringify(categoryData, null, 2));
    console.log('\n✅ Data saved to category-brand-data.json');

  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

analyzeData().catch(console.error);
