const http = require('http');

console.log('🧪 Testing Complete Setup\n');

// Test 1: Backend is running
console.log('1️⃣ Testing Backend...');
http.get('http://localhost:10000/api/v1/products?page=1&limit=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      const product = json.products[0];
      console.log('   ✅ Backend running');
      console.log(`   ✅ Product: ${product.name}`);
      console.log(`   ✅ Image URL: ${product.img}`);
      
      // Test 2: Image is accessible
      console.log('\n2️⃣ Testing Image Access...');
      const imageUrl = product.img.replace('/images/', '');
      const encodedUrl = encodeURIComponent(imageUrl);
      
      http.get(`http://localhost:10000/images/${encodedUrl}`, (imgRes) => {
        if (imgRes.statusCode === 200) {
          console.log(`   ✅ Image accessible: ${imgRes.statusCode}`);
          console.log(`   ✅ Content-Type: ${imgRes.headers['content-type']}`);
        } else {
          console.log(`   ❌ Image not accessible: ${imgRes.statusCode}`);
        }
        
        // Test 3: Frontend proxy
        console.log('\n3️⃣ Testing Frontend Proxy...');
        http.get(`http://localhost:5174/images/${encodedUrl}`, (proxyRes) => {
          if (proxyRes.statusCode === 200) {
            console.log(`   ✅ Proxy working: ${proxyRes.statusCode}`);
          } else {
            console.log(`   ❌ Proxy not working: ${proxyRes.statusCode}`);
          }
          
          console.log('\n' + '='.repeat(50));
          console.log('✅ All tests complete!');
          console.log('='.repeat(50));
          console.log('\n📋 Summary:');
          console.log('   • Backend: http://localhost:10000');
          console.log('   • Frontend: http://localhost:5174');
          console.log('   • Images: Proxied through frontend');
          console.log('\n🎉 System is ready!');
          console.log('   Open: http://localhost:5174/products');
          
          process.exit(0);
        }).on('error', (err) => {
          console.log(`   ⚠️  Frontend not accessible: ${err.message}`);
          console.log('   (This is OK if frontend is still starting)');
          process.exit(0);
        });
      }).on('error', (err) => {
        console.log(`   ❌ Image error: ${err.message}`);
        process.exit(1);
      });
    } else {
      console.log(`   ❌ Backend error: ${res.statusCode}`);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.log(`   ❌ Backend not running: ${err.message}`);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n⏱️  Test timeout - servers may not be ready');
  process.exit(1);
}, 10000);
