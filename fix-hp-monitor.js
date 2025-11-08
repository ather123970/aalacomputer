const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function fixHPMonitor() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('aalacomputer');
    const collection = db.collection('products');
    
    // Find the HP monitor with the wrong image URL
    const product = await collection.findOne({
      name: { $regex: /HP EliteDisplay E243.*Open Box/ }
    });
    
    if (product) {
      console.log('Found product:', product.name);
      console.log('Current img:', product.img);
      
      // Update with correct filename (169 instead of 16:9)
      const correctImg = '/images/HP EliteDisplay E243 23.8″ 169 IPS FHD (1920x1080p) 60HZ 94% SRGB Monitor (Open Box).jpg';
      
      await collection.updateOne(
        { _id: product._id },
        { 
          $set: { 
            img: correctImg,
            imageUrl: correctImg 
          } 
        }
      );
      
      console.log('✅ Updated to:', correctImg);
    } else {
      console.log('❌ Product not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixHPMonitor();
