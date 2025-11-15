const http = require('http');

async function testAllProducts() {
  console.log('Testing product loading...\n');
  
  try {
    // Test loading maximum products
    const url = 'http://localhost:10000/api/products?limit=5000';
    
    console.log(`Fetching: ${url}`);
    console.log('This may take a moment...\n');
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.setTimeout(60000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const products = JSON.parse(response.data);
      console.log(`✅ Total products loaded: ${products.length}`);
      
      if (products.length > 0) {
        console.log('\n📊 Product Statistics:');
        console.log(`   First product: ${products[0].Name || products[0].name || products[0].title || 'Unnamed'}`);
        console.log(`   Last product: ${products[products.length-1].Name || products[products.length-1].name || products[products.length-1].title || 'Unnamed'}`);
        
        // Count products by category
        const categoryCount = {};
        products.forEach(product => {
          const category = product.category || 'Uncategorized';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        console.log('\n📋 Top Categories:');
        Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .forEach(([category, count]) => {
            console.log(`   ${category}: ${count} products`);
          });
      }
    } else {
      console.log(`Error: ${response.statusCode}`);
      console.log(response.data);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAllProducts();