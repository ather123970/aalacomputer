/**
 * FIX ALL CATEGORIES
 * Runs all category fixes in sequence
 */

const { execSync } = require('child_process');

console.log('🚀 Starting comprehensive category cleanup...\n');

const scripts = [
  { name: 'Fix RAM Category', command: 'npm run fix-ram' },
  { name: 'Fix Categories (Processors & Motherboards)', command: 'npm run fix-categories' }
];

let successCount = 0;
let failCount = 0;

for (const script of scripts) {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Running: ${script.name}`);
    console.log('='.repeat(70) + '\n');
    
    execSync(script.command, { stdio: 'inherit', cwd: __dirname });
    successCount++;
    
    console.log(`\n✅ ${script.name} completed successfully\n`);
  } catch (error) {
    console.error(`\n❌ ${script.name} failed\n`);
    failCount++;
  }
}

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`✅ Successful: ${successCount}/${scripts.length}`);
console.log(`❌ Failed: ${failCount}/${scripts.length}`);
console.log('='.repeat(70) + '\n');

if (failCount === 0) {
  console.log('🎉 All category fixes completed successfully!\n');
} else {
  console.log('⚠️  Some fixes failed. Please check the logs above.\n');
  process.exit(1);
}
