const http = require('http');

// Test if backend can serve images
const testImages = [
  'LIAN LI Uni Fan TL LCD 120mm ARGB 3 Pack Black.jpg',
  'SteelSeries Arctis Nova 3P Wireless Multi-Platform Gaming Headset – White.jpg'
];

testImages.forEach(filename => {
  const encodedFilename = encodeURIComponent(filename);
  const url = `http://localhost:10000/images/${encodedFilename}`;
  
  console.log(`\nTesting: ${filename}`);
  console.log(`URL: ${url}`);
  
  http.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Image accessible');
    } else {
      console.log('❌ Image not accessible');
    }
  }).on('error', (err) => {
    console.log('❌ Error:', err.message);
  });
});

setTimeout(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}, 2000);
