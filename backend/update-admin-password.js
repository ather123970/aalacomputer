const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function updateAdminPassword() {
    const password = 'admin';
    const hash = await bcrypt.hash(password, 10);

    const adminData = {
        username: 'admin',
        email: 'admin@aalacomputer.com',
        passwordHash: hash,
        name: 'Site Admin'
    };

    const adminPath = path.join(__dirname, 'data', 'admin.json');
    fs.writeFileSync(adminPath, JSON.stringify(adminData, null, 2), 'utf8');

    // Verify
    const verify = await bcrypt.compare(password, hash);
    console.log('Password hash updated successfully!');
    console.log('Verification test:', verify ? 'PASS ✓' : 'FAIL ✗');
    console.log('Email: admin@aalacomputer.com');
    console.log('Password: admin');
}

updateAdminPassword().catch(console.error);
