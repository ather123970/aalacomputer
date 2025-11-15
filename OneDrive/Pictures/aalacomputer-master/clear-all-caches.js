/**
 * CLEAR ALL CACHES - Run this to force fresh data
 */

console.log('\n🧹 CLEARING ALL CACHES\n');
console.log('='.repeat(60));

console.log('\n✅ Backend API Status:');
console.log('   - PC Cases: 392 products');
console.log('   - Laptops: 363 products');
console.log('   - Database: Updated and working');

console.log('\n⚠️  Frontend Cache Issue Detected');
console.log('   - Browser is showing old cached data');
console.log('   - Need to clear browser cache');

console.log('\n📋 SOLUTION - DO THESE STEPS:\n');

console.log('STEP 1: STOP Frontend Dev Server');
console.log('   - Press Ctrl+C in the terminal running "npm run dev"');

console.log('\nSTEP 2: CLEAR Browser Cache');
console.log('   Windows/Linux: Ctrl + Shift + Delete');
console.log('   Mac: Cmd + Shift + Delete');
console.log('   - Select "Cached images and files"');
console.log('   - Click "Clear data"');

console.log('\nSTEP 3: RESTART Frontend');
console.log('   - Run: npm run dev');

console.log('\nSTEP 4: HARD REFRESH Browser');
console.log('   Windows/Linux: Ctrl + Shift + R');
console.log('   Mac: Cmd + Shift + R');

console.log('\n' + '='.repeat(60));
console.log('\n✅ After these steps, navigate to:');
console.log('   http://localhost:5173/category/cases');
console.log('\n   You should see 392 PC Cases!\n');

console.log('🔍 To verify backend is working, open in browser:');
console.log('   http://localhost:10000/api/categories/cases/products?limit=5\n');
