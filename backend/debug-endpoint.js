// Add this temporary diagnostic endpoint to backend/index.cjs
// Place it after the other route definitions

app.get('/api/debug/admin-config', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.resolve(__dirname, '..', 'data');
        const adminPath = path.join(dataDir, 'admin.json');

        const exists = fs.existsSync(adminPath);
        let content = null;
        let parsed = null;

        if (exists) {
            content = fs.readFileSync(adminPath, 'utf8');
            parsed = JSON.parse(content);
        }

        res.json({
            ok: true,
            adminPath,
            exists,
            hasEmail: parsed ? !!parsed.email : false,
            email: parsed ? parsed.email : null,
            hasPasswordHash: parsed ? !!parsed.passwordHash : false,
            passwordHashPreview: parsed && parsed.passwordHash ? parsed.passwordHash.substring(0, 20) + '...' : null
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

console.log('[debug] Added /api/debug/admin-config endpoint');
