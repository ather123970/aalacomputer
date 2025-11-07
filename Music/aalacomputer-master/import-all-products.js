const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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
  strict: false // Allow additional fields from database
});

const Product = mongoose.model('Product', ProductSchema);

async function importAllProducts() {
  try {
    // Get MongoDB URI from environment or use MongoDB Atlas as fallback
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB!');

    // Read from the main products database file
    const productsFile = path.join(__dirname, 'aalacomputer.productsd.json');
    
    if (!fs.existsSync(productsFile)) {
      console.error('Products file not found:', productsFile);
      process.exit(1);
    }
    
    console.log('Reading products from:', productsFile);
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log('Found', products.length, 'products to import');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Process products in batches for better performance
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      // Clean up each product in the batch
      const cleanedBatch = batch.map(product => {
        // Remove MongoDB ObjectId if present
        if (product._id) delete product._id;
        
        // Ensure required fields
        return {
          ...product,
          id: product.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: product.name || product.title || 'Unnamed Product',
          title: product.title || product.name || 'Unnamed Product',
          price: Number(product.price) || 0,
          category: product.category || '',
          brand: product.brand || '',
          img: product.img || product.imageUrl || '',
          imageUrl: product.imageUrl || product.img || '',
          description: product.description || '',
          WARRANTY: product.WARRANTY || '',
          link: product.link || '',
          createdAt: product.createdAt || new Date()
        };
      });
      
      try {
        await Product.insertMany(cleanedBatch, { ordered: false });
        imported += cleanedBatch.length;
        console.log(`Imported batch ${Math.ceil((i + batchSize) / batchSize)} - Total: ${imported}/${products.length}`);
      } catch (error) {
        console.error(`Error importing batch ${Math.ceil((i + batchSize) / batchSize)}:`, error.message);
        // Continue with next batch even if some products fail
      }
    }

    const finalCount = await Product.countDocuments();
    console.log(`Import completed! Total products in database: ${finalCount}`);
    
    // Test search functionality
    console.log('\nTesting search functionality...');
    const hpProducts = await Product.countDocuments({ 
      $or: [
        { name: { $regex: 'HP', $options: 'i' } },
        { title: { $regex: 'HP', $options: 'i' } }
      ]
    });
    console.log(`Found ${hpProducts} HP products`);
    
    const probookProducts = await Product.countDocuments({ 
      $or: [
        { name: { $regex: 'ProBook', $options: 'i' } },
        { title: { $regex: 'ProBook', $options: 'i' } }
      ]
    });
    console.log(`Found ${probookProducts} ProBook products`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importAllProducts().catch(console.error);
