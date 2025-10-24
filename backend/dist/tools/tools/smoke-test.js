#!/usr/bin/env node
import fetch from 'node-fetch';

const BASE = process.env.SMOKE_BASE || 'http://localhost:3000';

async function run() {
  try {
    const ping = await (await fetch(BASE + '/api/ping')).json();
    console.log('/api/ping ->', ping);
  } catch (e) {
    console.error('ping failed', e.message || e);
    process.exitCode = 2;
  }

  try {
    const post = await fetch(BASE + '/api/v1/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'smoke-1', name: 'SmokeItem', price: 1, qty: 1 }) });
    console.log('/api/v1/cart POST ->', post.status);
    const get = await (await fetch(BASE + '/api/v1/cart')).json();
    console.log('/api/v1/cart GET ->', get && get.length ? 'ok' : 'empty', get && get.length ? get.slice(0,2) : get);
  } catch (e) {
    console.error('cart test failed', e.message || e);
    process.exitCode = 3;
  }
}

run().catch(e=>{ console.error(e); process.exit(4); });
