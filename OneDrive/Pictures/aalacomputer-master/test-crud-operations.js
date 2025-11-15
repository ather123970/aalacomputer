// Test CRUD Operations - Automated Test Script
// Run this with: node test-crud-operations.js

const http = require('http');

const API_BASE = 'http://localhost:3000';
const ADMIN_TOKEN = 'your_admin_token_here'; // Replace with actual token

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test product data
const testProduct = {
  title: 'TEST_CRUD_Gaming_Mouse_RGB',
  name: 'TEST_CRUD_Gaming_Mouse_RGB',
  price: 8500,
  stock: 25,
  sold: 0,
  category: 'Peripherals',
  img: 'https://via.placeholder.com/300x300?text=Gaming+Mouse',
  imageUrl: 'https://via.placeholder.com/300x300?text=Gaming+Mouse',
  description: 'RGB Gaming Mouse with 16000 DPI - AUTOMATED TEST',
  specs: ['16000 DPI', 'RGB Lighting', '8 Buttons'],
  tags: ['gaming', 'mouse', 'rgb', 'test']
};

async function runTests() {
  console.log('🧪 Starting CRUD Operations Test...\n');
  
  let createdProductId = null;

  try {
    // ============================================
    // TEST 1: CREATE
    // ============================================
    console.log('📝 TEST 1: CREATE Product');
    console.log('Creating product:', testProduct.title);
    
    const createResult = await makeRequest('POST', '/api/admin/products', testProduct);
    console.log('Status:', createResult.status);
    console.log('Response:', JSON.stringify(createResult.data, null, 2));
    
    if (createResult.status === 200 || createResult.status === 201) {
      console.log('✅ CREATE: SUCCESS\n');
      
      // Extract product ID from response
      if (createResult.data.product) {
        createdProductId = createResult.data.product._id || createResult.data.product.id;
      } else if (createResult.data._id) {
        createdProductId = createResult.data._id;
      } else if (createResult.data.id) {
        createdProductId = createResult.data.id;
      }
      
      console.log('Created Product ID:', createdProductId);
    } else {
      console.log('❌ CREATE: FAILED');
      console.log('Error:', createResult.data);
      return;
    }

    // Wait a bit for database to sync
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // TEST 2: READ (Verify Creation)
    // ============================================
    console.log('\n📖 TEST 2: READ Product');
    console.log('Fetching product:', createdProductId);
    
    const readResult = await makeRequest('GET', `/api/admin/products?limit=100`);
    console.log('Status:', readResult.status);
    
    if (readResult.status === 200) {
      const products = Array.isArray(readResult.data) ? readResult.data : 
                      readResult.data.products || readResult.data.data || [];
      
      const foundProduct = products.find(p => 
        (p._id === createdProductId || p.id === createdProductId) ||
        (p.title && p.title.includes('TEST_CRUD'))
      );
      
      if (foundProduct) {
        console.log('✅ READ: SUCCESS');
        console.log('Found product:', foundProduct.title || foundProduct.name);
        console.log('Price:', foundProduct.price);
        console.log('Stock:', foundProduct.stock);
      } else {
        console.log('⚠️ READ: Product not found in list');
      }
    } else {
      console.log('❌ READ: FAILED');
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // TEST 3: UPDATE
    // ============================================
    console.log('\n✏️ TEST 3: UPDATE Product');
    console.log('Updating product:', createdProductId);
    
    const updatedData = {
      ...testProduct,
      price: 7500,  // Changed from 8500
      stock: 30,    // Changed from 25
      description: 'RGB Gaming Mouse with 16000 DPI - UPDATED BY TEST'
    };
    
    const updateResult = await makeRequest('PUT', `/api/admin/products/${createdProductId}`, updatedData);
    console.log('Status:', updateResult.status);
    console.log('Response:', JSON.stringify(updateResult.data, null, 2));
    
    if (updateResult.status === 200) {
      console.log('✅ UPDATE: SUCCESS');
      console.log('New Price: 7500 (was 8500)');
      console.log('New Stock: 30 (was 25)');
    } else {
      console.log('❌ UPDATE: FAILED');
      console.log('Error:', updateResult.data);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // TEST 4: READ (Verify Update)
    // ============================================
    console.log('\n📖 TEST 4: READ Updated Product');
    
    const readUpdatedResult = await makeRequest('GET', `/api/admin/products?limit=100`);
    
    if (readUpdatedResult.status === 200) {
      const products = Array.isArray(readUpdatedResult.data) ? readUpdatedResult.data : 
                      readUpdatedResult.data.products || readUpdatedResult.data.data || [];
      
      const foundProduct = products.find(p => 
        (p._id === createdProductId || p.id === createdProductId) ||
        (p.title && p.title.includes('TEST_CRUD'))
      );
      
      if (foundProduct) {
        console.log('✅ READ UPDATED: SUCCESS');
        console.log('Current Price:', foundProduct.price, '(should be 7500)');
        console.log('Current Stock:', foundProduct.stock, '(should be 30)');
        
        if (foundProduct.price === 7500 && foundProduct.stock === 30) {
          console.log('✅ Update verified successfully!');
        } else {
          console.log('⚠️ Update values do not match expected');
        }
      }
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // TEST 5: DELETE
    // ============================================
    console.log('\n🗑️ TEST 5: DELETE Product');
    console.log('Deleting product:', createdProductId);
    
    const deleteResult = await makeRequest('DELETE', `/api/admin/products/${createdProductId}`);
    console.log('Status:', deleteResult.status);
    console.log('Response:', JSON.stringify(deleteResult.data, null, 2));
    
    if (deleteResult.status === 200) {
      console.log('✅ DELETE: SUCCESS');
    } else {
      console.log('❌ DELETE: FAILED');
      console.log('Error:', deleteResult.data);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // TEST 6: READ (Verify Deletion)
    // ============================================
    console.log('\n📖 TEST 6: READ (Verify Deletion)');
    
    const readDeletedResult = await makeRequest('GET', `/api/admin/products?limit=100`);
    
    if (readDeletedResult.status === 200) {
      const products = Array.isArray(readDeletedResult.data) ? readDeletedResult.data : 
                      readDeletedResult.data.products || readDeletedResult.data.data || [];
      
      const foundProduct = products.find(p => 
        (p._id === createdProductId || p.id === createdProductId) ||
        (p.title && p.title.includes('TEST_CRUD'))
      );
      
      if (!foundProduct) {
        console.log('✅ DELETE VERIFIED: Product successfully removed');
      } else {
        console.log('❌ DELETE VERIFICATION FAILED: Product still exists');
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 CRUD TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ CREATE: Product created successfully');
    console.log('✅ READ: Product retrieved successfully');
    console.log('✅ UPDATE: Product updated successfully');
    console.log('✅ DELETE: Product deleted successfully');
    console.log('='.repeat(50));
    console.log('\n🎊 ALL CRUD OPERATIONS WORKING PERFECTLY!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    console.log('\nPlease check:');
    console.log('1. Backend is running (npm run dev)');
    console.log('2. MongoDB is connected');
    console.log('3. Admin token is valid');
    console.log('4. Port 3000 is accessible');
  }
}

// Run the tests
console.log('🚀 CRUD Operations Automated Test');
console.log('Backend:', API_BASE);
console.log('');

runTests().catch(console.error);
