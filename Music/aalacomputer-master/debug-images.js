// Debug script to check image loading in browser context
const http = require('http');

console.log('🔍 Debugging Image Loading\n');

// Test different URL formats
const tests = [
  {
    name: 'Backend Direct',
    url: 'http://localhost:10000/images/LIAN%20LI%20Uni%20Fan%20TL%20LCD%20120mm%20ARGB%203%20Pack%20Black.jpg'
  },
  {
    name: 'Frontend Proxy',
    url: 'http://localhost:5174/images/LIAN%20LI%20Uni%20Fan%20TL%20LCD%20120mm%20ARGB%203%20Pack%20Black.jpg'
  },
  {
    name: 'Frontend Proxy (unencoded)',
    url: 'http://localhost:5174/images/LIAN LI Uni Fan TL LCD 120mm ARGB 3 Pack Black.jpg'
  }
];

let completed = 0;

tests.forEach(test => {
  console.log(`Testing: ${test.name}`);
  console.log(`URL: ${test.url}\n`);
  
  http.get(test.url, (res) => {
    console.log(`✅ ${test.name}:`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);
    console.log(`   Content-Length: ${res.headers['content-length']}`);
    console.log('');
    
    completed++;
    if (completed === tests.length) {
      console.log('='.repeat(50));
      console.log('All tests complete!');
      console.log('='.repeat(50));
      process.exit(0);
    }
  }).on('error', (err) => {
    console.log(`❌ ${test.name}: ${err.message}\n`);
    completed++;
    if (completed === tests.length) {
      process.exit(1);
    }
  });
});

setTimeout(() => {
  console.log('Timeout - some tests did not complete');
  process.exit(1);
}, 5000);
