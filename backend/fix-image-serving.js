/**
 * Fix Image Serving - Diagnose and fix image loading issues
 * WITHOUT modifying the database
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function diagnoseImages() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const schema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.model('Product', schema, 'products');

    console.log('\n📊 Analyzing first 10 products...\n');

    const products = await Product.find()
      .select('_id name img imageUrl image imageUrlPrimary')
      .limit(10)
      .lean();

    products.forEach((product, idx) => {
      console.log(`\n${idx + 1}. ${product.name}`);
      console.log(`   _id: ${product._id}`);
      console.log(`   img: ${product.img ? product.img.substring(0, 80) + '...' : 'EMPTY'}`);
      console.log(`   imageUrl: ${product.imageUrl ? product.imageUrl.substring(0, 80) + '...' : 'EMPTY'}`);
      console.log(`   image: ${product.image ? product.image.substring(0, 80) + '...' : 'EMPTY'}`);
      console.log(`   imageUrlPrimary: ${product.imageUrlPrimary ? product.imageUrlPrimary.substring(0, 80) + '...' : 'EMPTY'}`);

      // Check image type
      if (product.img) {
        if (product.img.startsWith('data:')) {
          console.log(`   ✅ img is BASE64`);
        } else if (product.img.startsWith('http')) {
          console.log(`   ✅ img is EXTERNAL URL`);
        } else {
          console.log(`   ⚠️ img is LOCAL PATH`);
        }
      }
    });

    // Count image types
    console.log('\n\n📈 Image Statistics:\n');

    const stats = await Product.aggregate([
      {
        $facet: {
          base64: [
            { $match: { img: { $regex: '^data:' } } },
            { $count: 'count' }
          ],
          external: [
            { $match: { img: { $regex: '^https?:' } } },
            { $count: 'count' }
          ],
          local: [
            { $match: { img: { $not: { $regex: '^data:|^https?:' }, $ne: '' } } },
            { $count: 'count' }
          ],
          empty: [
            { $match: { img: { $in: ['', null, undefined] } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    console.log(`Base64 images: ${stats[0].base64[0]?.count || 0}`);
    console.log(`External URLs: ${stats[0].external[0]?.count || 0}`);
    console.log(`Local paths: ${stats[0].local[0]?.count || 0}`);
    console.log(`Empty: ${stats[0].empty[0]?.count || 0}`);

    await mongoose.disconnect();
    console.log('\n✅ Diagnosis complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseImages();
