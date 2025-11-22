// Test script to verify image extraction is working
const axios = require('axios');

async function testImageExtraction() {
  try {
    console.log('🧪 Testing image extraction...\n');

    // Test with a product name
    const testProducts = [
      'Intel Core i5 Processor',
      'ASUS RTX 3060 Graphics Card',
      'Kingston DDR4 RAM 16GB'
    ];

    for (const productName of testProducts) {
      console.log(`\n📦 Testing: "${productName}"`);
      console.log('━'.repeat(60));

      try {
        // Call the backend endpoint
        const response = await axios.post('http://localhost:10000/api/admin/extract-image', 
          { productName },
          {
            headers: {
              'Authorization': 'Bearer test-token', // Mock token
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        if (response.data && response.data.imageUrl) {
          const url = response.data.imageUrl;
          console.log('✅ Image URL found:');
          console.log(`   ${url.substring(0, 100)}...`);
          
          // Check if it's a real image URL
          const isRealImage = url.includes('http') && 
            (url.includes('.jpg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp'));
          
          const isGoogleImages = url.includes('google') || url.includes('gstatic') || url.includes('ggpht');
          const isBingImages = url.includes('bing') || url.includes('msnbot');
          
          console.log(`\n📊 URL Analysis:`);
          console.log(`   Real Image URL: ${isRealImage ? '✅ YES' : '❌ NO'}`);
          console.log(`   From Google: ${isGoogleImages ? '✅ YES' : '❌ NO'}`);
          console.log(`   From Bing: ${isBingImages ? '⚠️ YES (WRONG!)' : '✅ NO'}`);
          console.log(`   URL Length: ${url.length} chars`);
        } else {
          console.log('❌ No image URL returned');
          console.log('Response:', response.data);
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
          console.log('Response:', error.response.data);
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Test complete!');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

testImageExtraction();
