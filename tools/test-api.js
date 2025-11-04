import fetch from 'node-fetch';

async function run() {
  try {
    const ping = await fetch('http://localhost:3001/api/ping');
    console.log('ping status', ping.status);
    console.log(await ping.json());

    const post = await fetch('http://localhost:3001/api/v1/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'p_test', name: 'Test', price: 1000 }) });
    console.log('post cart status', post.status);
    console.log(await post.json());

    const get = await fetch('http://localhost:3001/api/v1/cart');
    console.log('get cart status', get.status);
    console.log(await get.json());
  } catch (e) {
    console.error('test error', e);
    process.exit(2);
  }
}
run();
