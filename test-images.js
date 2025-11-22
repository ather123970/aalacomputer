const mongoose = require('mongoose');

async function testImages() {
  try {
    const uri = 'mongodb+srv://uni804043_db_user:2124377as@cluster0.0cy1usa.mongodb.net/aalacomputer?retryWrites=true&w=majority';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected\n');

    const schema = new mongoose.Schema({}, { strict: false });
    const TestProduct = mongoose.model('TestProduct', schema, 'testproduct');

    // Count totals
    const total = await TestProduct.countDocuments();
    console.log('📊 IMAGE ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Total products:', total);

    // Check img field
    const withImg = await TestProduct.countDocuments({ 
      img: { $exists: true, $ne: null, $ne: '' } 
    });
    console.log('✅ With img field:', withImg);

    // Check imageUrl field
    const withImageUrl = await TestProduct.countDocuments({ 
      imageUrl: { $exists: true, $ne: null, $ne: '' } 
    });
    console.log('✅ With imageUrl field:', withImageUrl);

    // Check image field
    const withImage = await TestProduct.countDocuments({ 
      image: { $exists: true, $ne: null, $ne: '' } 
    });
    console.log('✅ With image field:', withImage);

    // Products with at least one image field
    const withAnyImage = await TestProduct.countDocuments({
      $or: [
        { img: { $exists: true, $ne: null, $ne: '' } },
        { imageUrl: { $exists: true, $ne: null, $ne: '' } },
        { image: { $exists: true, $ne: null, $ne: '' } }
      ]
    });
    console.log('✅ With ANY image:', withAnyImage);

    // Products with NO images
    const noImages = total - withAnyImage;
    console.log('❌ NO images:', noImages);

    console.log('\n📈 STATISTICS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Coverage:', ((withAnyImage / total) * 100).toFixed(2) + '%');
    console.log('Missing:', ((noImages / total) * 100).toFixed(2) + '%');

    // Sample products
    console.log('\n📋 SAMPLE PRODUCTS WITH IMAGES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const samples = await TestProduct.find({ 
      $or: [
        { img: { $exists: true, $ne: null, $ne: '' } },
        { imageUrl: { $exists: true, $ne: null, $ne: '' } }
      ]
    }).limit(3).lean();
    
    samples.forEach((p, i) => {
      const imgUrl = p.img || p.imageUrl || p.image || 'N/A';
      const preview = String(imgUrl).substring(0, 60) + (String(imgUrl).length > 60 ? '...' : '');
      console.log(`${i+1}. ${p.name}`);
      console.log(`   Image: ${preview}`);
    });

    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testImages();
