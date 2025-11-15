#!/usr/bin/env node
// Smoke test for admin CRUD -> create product and verify public listing
// Usage: node tools/smoke-test-admin-crud.js

const fetchFn = (typeof fetch !== 'undefined') ? fetch : (async (...args) => { const nf = await import('node-fetch'); return nf.default(...args); });

(async function(){
  const BASE = process.env.API_BASE || process.env.VITE_BACKEND_URL || 'http://localhost:10000';
  const loginUrl = `${BASE.replace(/\/+$/,'')}/api/admin/login`;
  const createUrl = `${BASE.replace(/\/+$/,'')}/api/admin/products`;
  const publicUrl = `${BASE.replace(/\/+$/,'')}/api/products`;

  console.log('[smoke] Using base:', BASE);

  try {
    // 1) Login
    const creds = { email: 'aalacomputerstore@gmail.com', password: 'karachi123' };
    console.log('[smoke] Logging in as admin...');
    const r1 = await fetchFn(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    if (!r1.ok) {
      console.error('[smoke] Login request failed:', r1.status, r1.statusText);
      process.exit(2);
    }
    const j1 = await r1.json();
    if (!j1 || !j1.ok || !j1.token) {
      console.error('[smoke] Login failed or token not returned:', j1);
      process.exit(3);
    }
    const token = j1.token;
    console.log('[smoke] Login successful, token length=', (token||'').length);

    // 2) Create product
    const testId = `smoke_${Date.now()}`;
    const payload = {
      id: testId,
      title: `Smoke Test Product ${Date.now()}`,
      name: `Smoke Test Product ${Date.now()}`,
      price: 12345,
      category: 'Test',
      stock: 10,
      sold: 0,
      description: 'Created by smoke test'
    };

    console.log('[smoke] Creating product with id=', testId);
    const r2 = await fetchFn(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const j2 = await r2.json().catch(()=>null);
    if (!r2.ok || !j2 || !(j2.ok || j2.product)) {
      console.error('[smoke] Create product failed:', r2.status, r2.statusText, j2);
      process.exit(4);
    }
    console.log('[smoke] Create product response OK');

    // 3) Wait briefly for any eventual consistency
    await new Promise(r=>setTimeout(r, 800));

    // 4) Fetch public products and verify presence
    console.log('[smoke] Fetching public products...');
    const r3 = await fetchFn(publicUrl);
    if (!r3.ok) {
      console.error('[smoke] Public products request failed:', r3.status, r3.statusText);
      process.exit(5);
    }
    const products = await r3.json().catch(()=>null);
    if (!Array.isArray(products)) {
      console.error('[smoke] Public products response not array:', products);
      process.exit(6);
    }

    const found = products.find(p => String(p.id) === String(testId) || String(p.title || p.name).includes('Smoke Test Product'));
    if (found) {
      console.log('[smoke] SUCCESS: product found in public listing:', (found.id || found.title || found.name));
      process.exit(0);
    } else {
      console.error('[smoke] FAILURE: newly created product not found in public listing. Total products returned=', products.length);
      // Optionally print last 5 ids
      console.error('Sample ids:', products.slice(0,5).map(x=>x.id || x.title || x.name));
      process.exit(7);
    }

  } catch (err) {
    console.error('[smoke] Unexpected error:', err && (err.stack || err));
    process.exit(1);
  }
})();
