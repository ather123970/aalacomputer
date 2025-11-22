// Test pagination API
const fetch = require('node-fetch');

async function testPagination() {
  try {
    console.log('Testing page 1...');
    const page1 = await fetch('http://localhost:5173/api/admin/products?limit=50&page=1');
    const data1 = await page1.json();
    console.log('Page 1:', data1.products?.length || 0, 'products');
    
    console.log('Testing page 2...');
    const page2 = await fetch('http://localhost:5173/api/admin/products?limit=50&page=2');
    const data2 = await page2.json();
    console.log('Page 2:', data2.products?.length || 0, 'products');
    
    // Check if products are different
    if (data1.products && data2.products) {
      const firstId1 = data1.products[0]?._id || data1.products[0]?.id;
      const firstId2 = data2.products[0]?._id || data2.products[0]?.id;
      console.log('Page 1 first ID:', firstId1);
      console.log('Page 2 first ID:', firstId2);
      console.log('Different pages:', firstId1 !== firstId2 ? '✅ YES' : '❌ NO');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPagination();
