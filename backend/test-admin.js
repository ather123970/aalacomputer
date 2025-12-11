// Test script to verify admin.json is readable
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dataDir = path.resolve(__dirname, '..', 'data');
const adminPath = path.join(dataDir, 'admin.json');

console.log('=== ADMIN.JSON TEST ===');
console.log('Looking for admin.json at:', adminPath);
console.log('File exists:', fs.existsSync(adminPath));

if (fs.existsSync(adminPath)) {
    const raw = fs.readFileSync(adminPath, 'utf8');
    console.log('\nRaw content length:', raw.length, 'bytes');

    const admin = JSON.parse(raw);
    console.log('\nParsed admin object:');
    console.log('- username:', admin.username);
    console.log('- email:', admin.email);
    console.log('- name:', admin.name);
    console.log('- passwordHash:', admin.passwordHash ? admin.passwordHash.substring(0, 20) + '...' : 'MISSING');

    // Test password
    bcrypt.compare('admin', admin.passwordHash).then(match => {
        console.log('\nPassword "admin" matches hash:', match ? '✓ YES' : '✗ NO');

        if (match) {
            console.log('\n✅ Everything looks good! Login should work.');
        } else {
            console.log('\n❌ Password hash does not match "admin"');
        }
    });
} else {
    console.log('\n❌ File not found!');
}
