const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';

async function checkDB() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('aalacomputer');
    const collection = db.collection('products');
    
    // Get a sample product
    const product = await collection.findOne({ name: { $regex: /SteelSeries Arctis Nova 3P/ } });
    
    if (product) {
      console.log('Sample Product:');
      console.log('  Name:', product.name);
      console.log('  Image:', product.img);
      console.log('  ImageUrl:', product.imageUrl);
    }
    
    // Count total products
    const count = await collection.countDocuments();
    console.log('\nTotal products:', count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkDB();
