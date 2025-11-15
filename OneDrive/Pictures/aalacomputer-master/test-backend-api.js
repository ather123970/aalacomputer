/**
 * TEST BACKEND API DIRECTLY
 * Tests if the backend search API is returning correct results
 */

const http = require('http');

function testSearch(query) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `http://localhost:10000/api/admin/products?search=${encodedQuery}`;
    
    console.log(`\n🔍 Testing: "${query}"`);
    console.log(`URL: ${url}\n`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (json.products && Array.isArray(json.products)) {
            console.log(`✅ Found ${json.products.length} products:`);
            json.products.forEach((p, i) => {
              console.log(`   ${i + 1}. ${p.name || p.title || 'Unnamed'}`);
            });
          } else {
            console.log(`❌ No products array in response`);
            console.log(`Response:`, json);
          }
          
          resolve(json);
        } catch (e) {
          console.error('❌ Failed to parse response:', e.message);
          console.log('Raw response:', data.substring(0, 200));
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Request failed: ${e.message}`);
      console.log(`\n⚠️  Is the backend server running?`);
      console.log(`   Start it with: npm run backend\n`);
      reject(e);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('TESTING BACKEND SEARCH API');
  console.log('='.repeat(70));
  
  try {
    // Test 1: SAPPHIRE search
    await testSearch('SAPPHIRE PULSE Radeon');
    
    console.log('\n' + '='.repeat(70));
    
    // Test 2: Short search
    await testSearch('SAPPHIRE RX 550');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS COMPLETE');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ TESTS FAILED');
    console.log('='.repeat(70) + '\n');
  }
}

runTests();
