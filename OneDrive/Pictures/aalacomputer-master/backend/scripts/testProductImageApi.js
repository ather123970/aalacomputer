// Test our /api/product-image endpoint for laptop vs graphics products
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:10000';

async function testProductImage(productId, productName, category) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${productName}`);
  console.log(`Category: ${category}`);
  console.log(`ID: ${productId.substring(0, 60)}...`);
  console.log(`${'='.repeat(80)}`);
  
  const url = `${API_BASE}/api/product-image/${productId}`;
  console.log(`Calling: ${url}\n`);
  
  try {
    const response = await fetch(url, {
      timeout: 15000
    });
    
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        console.log('✅ IMAGE RETURNED SUCCESSFULLY!');
        return true;
      } else {
        console.log('❌ Response is not an image');
        console.log('Content-Type:', contentType);
        // Try to read as text to see error
        try {
          const text = await response.text();
          console.log('Response:', text.substring(0, 200));
        } catch (e) {}
        return false;
      }
    } else {
      console.log('❌ API returned error status');
      return false;
    }
  } catch (error) {
    console.log('❌ REQUEST FAILED:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 TESTING /api/product-image ENDPOINT');
  console.log('Comparing laptop vs graphics card products\n');
  
  // Test cases from database
  const tests = [
    {
      id: 'zah_acer_predator_helios_18_ai_ph18_73_96y0_gaming_laptop_intel_core_ultra_9_275hx_32gb_ddr5_1tb_ssd_nvidia_rtx_5080_16gb_graphics_18__wqxga_ips_mini_led_250hz_windows_11_home',
      name: 'Acer Predator Helios 18 AI (Laptop)',
      category: 'LAPTOP'
    },
    {
      id: 'zah_asus_zenbook_ux3405ca_intel_core_ultra_7_255h_16gb_ddr5_512gb_ssd_intel_arc_graphics_14__fhd__oled_60hz_touch_screen_windows_11_home_jasper_grey',
      name: 'Asus Zenbook UX3405CA (Laptop)',
      category: 'LAPTOP'
    }
  ];
  
  console.log('⚠️  Make sure your backend server is running on http://localhost:10000\n');
  
  const results = [];
  for (const test of tests) {
    const success = await testProductImage(test.id, test.name, test.category);
    results.push({ ...test, success });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY:');
  console.log(`${'='.repeat(80)}`);
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.category}: ${result.name}`);
  });
  
  const laptopFailed = results.filter(r => r.category === 'LAPTOP' && !r.success).length;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('DIAGNOSIS:');
  
  if (laptopFailed > 0) {
    console.log('❌ /api/product-image endpoint is FAILING for laptop products');
    console.log('   Check backend console logs for errors like:');
    console.log('   - [product-image] Direct fetch error');
    console.log('   - [product-image] External fetch failed');
    console.log('   - Timeout errors');
  } else {
    console.log('✅ /api/product-image endpoint works for laptop products!');
    console.log('   Issue must be in the frontend SmartImage component');
  }
  
  console.log(`${'='.repeat(80)}\n`);
}

runTests();
