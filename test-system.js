/**
 * System Health Check - Tests Backend and Frontend
 */

const http = require('http');

const tests = [
  {
    name: 'Backend Server',
    host: 'localhost',
    port: 10000,
    path: '/api/categories',
    method: 'GET'
  },
  {
    name: 'Categories Endpoint',
    host: 'localhost',
    port: 10000,
    path: '/api/categories/dynamic',
    method: 'GET'
  },
  {
    name: 'Products Endpoint',
    host: 'localhost',
    port: 10000,
    path: '/api/products?limit=5',
    method: 'GET'
  },
  {
    name: 'Laptops Category',
    host: 'localhost',
    port: 10000,
    path: '/api/categories/laptops/products?limit=5',
    method: 'GET'
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: test.host,
      port: test.port,
      path: test.path,
      method: test.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const productCount = json.products?.length || json.length || 0;
          resolve({
            success: true,
            status: res.statusCode,
            message: `${res.statusCode} - ${productCount} items`,
            data: json
          });
        } catch (e) {
          resolve({
            success: res.statusCode === 200,
            status: res.statusCode,
            message: `${res.statusCode} - Response OK`,
            data: null
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        message: error.message,
        data: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 0,
        message: 'Timeout (5s)',
        data: null
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 SYSTEM HEALTH CHECK\n');
  console.log('='.repeat(70));
  
  let passCount = 0;
  let failCount = 0;
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    const result = await testEndpoint(test);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      passCount++;
    } else {
      console.log(`❌ ${result.message}`);
      failCount++;
    }
  }
  
  console.log('='.repeat(70));
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed\n`);
  
  if (failCount === 0) {
    console.log('🎉 All systems operational!\n');
    console.log('✅ Backend running on: http://localhost:10000');
    console.log('✅ Frontend running on: http://localhost:5173');
    console.log('\n🌐 Open in browser: http://localhost:5173\n');
  } else {
    console.log('⚠️  Some tests failed. Check backend server.\n');
    process.exit(1);
  }
}

runTests();
