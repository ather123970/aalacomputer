// Fix products where img and imageUrl are out of sync
// Prioritize imageUrl (what admin updates) and sync it to img field

require('dotenv').config();
const mongoose = require('mongoose');

const ProductSchemaDef = {
  id: { type: String, index: true, unique: true },
  brand: { type: String, default: '' },
  name: String,
  title: String,
  price: { type: Number, default: 0 },
  img: String,
  imageUrl: String,
  image: String,
  description: String,
  category: String,
  WARRANTY: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
};

async function fixImageFields() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      console.error('Please set MONGODB_URI in your .env file');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    console.log(`URI: ${mongoUri.substring(0, 30)}...`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected!');

    const schema = new mongoose.Schema(ProductSchemaDef, {
      timestamps: false,
      strict: false
    });
    const Product = mongoose.model('Product', schema);

    // Find products where imageUrl and img are different
    const products = await Product.find({}).lean();
    
    let fixed = 0;
    let checked = 0;

    for (const product of products) {
      checked++;
      
      // Prioritize imageUrl over img (admin updates imageUrl)
      const correctImage = product.imageUrl || product.image || product.img;
      
      // Check if fields are out of sync
      const needsUpdate = 
        product.img !== correctImage || 
        product.imageUrl !== correctImage ||
        product.image !== correctImage;
      
      if (needsUpdate && correctImage) {
        console.log(`\nFixing: ${product.name || product.title}`);
        console.log(`  OLD img: ${product.img || 'N/A'}`);
        console.log(`  OLD imageUrl: ${product.imageUrl || 'N/A'}`);
        console.log(`  OLD image: ${product.image || 'N/A'}`);
        console.log(`  NEW (all): ${correctImage}`);
        
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              img: correctImage,
              imageUrl: correctImage,
              image: correctImage
            }
          }
        );
        
        fixed++;
      }
    }

    console.log(`\n\n✅ DONE!`);
    console.log(`Checked: ${checked} products`);
    console.log(`Fixed: ${fixed} products`);
    console.log(`\nAll image fields are now synced! 🎉`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

fixImageFields();
