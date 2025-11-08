const http = require('http');

console.log('🧪 Testing Admin CRUD Operations\n');

const BASE_URL = 'http://localhost:10000';
let authToken = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'aalacomputerstore@gmail.com',
      password: 'admin123' // Default password from seed
    });
    
    if (loginRes.status === 200 && loginRes.data.token) {
      authToken = loginRes.data.token;
      console.log('   ✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('   ❌ Login failed:', loginRes.status);
      return;
    }

    // Test 2: Get Products
    console.log('\n2️⃣ Testing Get Products...');
    const productsRes = await makeRequest('GET', '/api/v1/products?page=1&limit=5');
    if (productsRes.status === 200) {
      console.log(`   ✅ Retrieved ${productsRes.data.products?.length || 0} products`);
      console.log(`   Total: ${productsRes.data.total || 0}`);
    } else {
      console.log('   ❌ Failed:', productsRes.status);
    }

    // Test 3: Create Product
    console.log('\n3️⃣ Testing Create Product...');
    const newProduct = {
      name: 'Test Product ' + Date.now(),
      price: 50000,
      category: 'Test',
      brand: 'Test Brand',
      img: '/images/test.jpg',
      description: 'Test product for CRUD operations'
    };
    
    const createRes = await makeRequest('POST', '/api/admin/products', newProduct);
    let createdProductId = null;
    
    if (createRes.status === 200 || createRes.status === 201) {
      createdProductId = createRes.data._id || createRes.data.id;
      console.log('   ✅ Product created');
      console.log(`   ID: ${createdProductId}`);
    } else {
      console.log('   ❌ Failed:', createRes.status);
    }

    // Test 4: Update Product
    if (createdProductId) {
      console.log('\n4️⃣ Testing Update Product...');
      const updateRes = await makeRequest('PUT', `/api/admin/products/${createdProductId}`, {
        price: 55000,
        description: 'Updated test product'
      });
      
      if (updateRes.status === 200) {
        console.log('   ✅ Product updated');
      } else {
        console.log('   ❌ Failed:', updateRes.status);
      }
    }

    // Test 5: Delete Product
    if (createdProductId) {
      console.log('\n5️⃣ Testing Delete Product...');
      const deleteRes = await makeRequest('DELETE', `/api/admin/products/${createdProductId}`);
      
      if (deleteRes.status === 200 || deleteRes.status === 204) {
        console.log('   ✅ Product deleted');
      } else {
        console.log('   ❌ Failed:', deleteRes.status);
      }
    }

    // Test 6: Get Deals
    console.log('\n6️⃣ Testing Get Deals...');
    const dealsRes = await makeRequest('GET', '/api/v1/deals');
    if (dealsRes.status === 200) {
      console.log(`   ✅ Retrieved ${dealsRes.data.length || 0} deals`);
    } else {
      console.log('   ❌ Failed:', dealsRes.status);
    }

    // Test 7: Get Prebuilds
    console.log('\n7️⃣ Testing Get Prebuilds...');
    const prebuildsRes = await makeRequest('GET', '/api/v1/prebuilds');
    if (prebuildsRes.status === 200) {
      console.log(`   ✅ Retrieved ${prebuildsRes.data.length || 0} prebuilds`);
    } else {
      console.log('   ❌ Failed:', prebuildsRes.status);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All CRUD tests complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

runTests();
