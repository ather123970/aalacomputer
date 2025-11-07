const mongoose = require('mongoose');

// Product Schema (matching the backend model)
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

async function testDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!');

    // Test total product count
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in database: ${totalProducts}`);

    // Test HP ProBook search
    const hpProbookQuery = {
      $or: [
        { name: { $regex: 'HP ProBook 445 G7', $options: 'i' } },
        { title: { $regex: 'HP ProBook 445 G7', $options: 'i' } }
      ]
    };
    
    const hpProbookCount = await Product.countDocuments(hpProbookQuery);
    console.log(`HP ProBook 445 G7 products found: ${hpProbookCount}`);
    
    if (hpProbookCount > 0) {
      const sampleProduct = await Product.findOne(hpProbookQuery);
      console.log('Sample HP ProBook product:', {
        id: sampleProduct.id,
        name: sampleProduct.name,
        title: sampleProduct.title,
        price: sampleProduct.price,
        category: sampleProduct.category
      });
    }

    // Test general search
    const generalSearchQuery = {
      $or: [
        { name: { $regex: 'HP', $options: 'i' } },
        { title: { $regex: 'HP', $options: 'i' } }
      ]
    };
    
    const hpProductsCount = await Product.countDocuments(generalSearchQuery);
    console.log(`Total HP products: ${hpProductsCount}`);

    // Test pagination
    const pageSize = 32;
    const firstPageProducts = await Product.find({})
      .lean()
      .sort({ createdAt: -1 })
      .limit(pageSize);
    
    console.log(`First page loaded ${firstPageProducts.length} products`);
    console.log(`Total pages: ${Math.ceil(totalProducts / pageSize)}`);

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testDatabase().catch(console.error);
