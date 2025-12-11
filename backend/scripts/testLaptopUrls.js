// Test if laptop image URLs are actually accessible
const fetch = require('node-fetch');

const testUrls = [
  // Laptop URLs from database
  'https://zahcomputers.pk/wp-content/uploads/2025/10/Acer-Predator-Helios-18-AI-PH18-73-96Y0-Gaming-Laptop-Intel-Core-Ultra-9-275HX-32GB-DDR5-1TB-SSD-NVIDIA-RTX-5080-16GB-Graphics-18-WQXGA-IPS-Mini-LED-250Hz-Windows-11-Home-Price-in-Pakistan-450x450.jpg',
  'https://zahcomputers.pk/wp-content/uploads/2025/10/Asus-Zenbook-UX3405CA-Intel-Core-Ultra-7-255H-16GB-DDR5-512GB-SSD-Intel-Arc-Graphics-14-FHD-OLED-60Hz-Touch-Screen-Windows-11-Home-Jasper-Grey-Price-in-Pakistan-450x450.jpg',
  // Graphics card URL from database (working)
  'https://zahcomputers.pk/wp-content/uploads/2025/11/MSI-Gaming-GeForce-RTX-4090-24GB-GDDR6X-PCI-Express-4.0-Video-Card-Open-Box-Price-in-Pakistan-450x450.jpg'
];

async function testUrl(url, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Test ${index + 1}: ${url.substring(0, 100)}...`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    console.log('Attempting fetch...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://zahcomputers.pk/'
      },
      timeout: 10000
    });
    
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));
    
    if (response.ok) {
      console.log('✅ URL is accessible!');
      return true;
    } else {
      console.log('❌ URL returned error status');
      return false;
    }
  } catch (error) {
    console.log('❌ FETCH FAILED:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 TESTING LAPTOP VS GRAPHICS CARD IMAGE URLS');
  console.log('This will test if the external URLs are actually accessible\n');
  
  const results = [];
  
  for (let i = 0; i < testUrls.length; i++) {
    const success = await testUrl(testUrls[i], i);
    results.push({ url: testUrls[i], success });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY:');
  console.log(`${'='.repeat(80)}`);
  
  results.forEach((result, index) => {
    const type = index < 2 ? 'LAPTOP' : 'GRAPHICS';
    console.log(`${result.success ? '✅' : '❌'} ${type}: ${result.url.substring(50, 120)}...`);
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('DIAGNOSIS:');
  
  const laptopSuccess = results[0].success && results[1].success;
  const graphicsSuccess = results[2].success;
  
  if (!laptopSuccess && graphicsSuccess) {
    console.log('❌ Laptop URLs are NOT accessible but graphics URLs are');
    console.log('   CAUSE: Laptop images might not exist at zahcomputers.pk');
    console.log('   OR: Laptop URLs might be blocked/rate-limited');
  } else if (!laptopSuccess && !graphicsSuccess) {
    console.log('❌ ALL zahcomputers.pk URLs are not accessible');
    console.log('   CAUSE: zahcomputers.pk might be blocking our requests');
    console.log('   OR: Network/firewall issue');
  } else if (laptopSuccess && graphicsSuccess) {
    console.log('✅ All URLs are accessible!');
    console.log('   CAUSE: Issue must be in our frontend/backend image loading logic');
  }
  
  console.log(`${'='.repeat(80)}\n`);
}

runTests();
