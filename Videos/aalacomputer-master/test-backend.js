/**
 * Quick test to check if backend is running and products can be fetched
 */

const http = require('http');

console.log('🔍 Testing backend connection...\n');

const options = {
  hostname: 'localhost',
  port: 10000,
  path: '/api/products?limit=5',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const products = JSON.parse(data);
        console.log('✅ Backend is running!');
        console.log(`✅ Port: 10000`);
        console.log(`✅ Products fetched: ${Array.isArray(products) ? products.length : 'N/A'}`);
        
        if (Array.isArray(products) && products.length > 0) {
          console.log(`\n📦 Sample product:`);
          const sample = products[0];
          console.log(`   Name: ${sample.name || sample.Name || 'N/A'}`);
          console.log(`   Price: PKR ${sample.price || 'N/A'}`);
          console.log(`   Category: ${sample.category || 'N/A'}`);
          console.log(`   Brand: ${sample.brand || 'N/A'}`);
        }
        
        console.log('\n🎉 Everything looks good! You can now start the frontend.\n');
      } catch (e) {
        console.log('❌ Invalid JSON response');
        console.log('Response:', data.substring(0, 200));
      }
    } else {
      console.log(`❌ Backend returned status ${res.statusCode}`);
      console.log('Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Cannot connect to backend!');
  console.log(`❌ Error: ${error.message}`);
  console.log('\n💡 Solution:');
  console.log('   1. Open a terminal');
  console.log('   2. Run: npm run backend');
  console.log('   3. Wait for "Backend server listening on port 10000"');
  console.log('   4. Run this test again\n');
});

req.on('timeout', () => {
  console.log('❌ Request timed out!');
  req.destroy();
});

req.end();
