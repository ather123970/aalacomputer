import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

function makeReqRes(method='GET', url='/api/ping', body=null) {
  const headers = { 'content-type': 'application/json' };
  const req = new http.IncomingMessage();
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.body = body;
  const res = new http.ServerResponse(req);
  let data = '';
  res.write = (chunk) => { data += chunk; return true; };
  res.end = (chunk) => { if (chunk) data += chunk; res.__ended = true; res.__data = data; };
  res.json = (obj) => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(obj)); };
  res.status = (s) => { res.statusCode = s; return res; };
  res.setHeader = () => {};
  return { req, res };
}

async function run() {
  try {
    // ping
    const pingMod = await import('../api/ping.js');
    const { req: r1, res: s1 } = makeReqRes('GET','/api/ping');
    await pingMod.default(r1, s1);
    console.log('/api/ping ->', s1.__data);

    const cartMod = await import('../api/v1/cart.js');
    const { req: r2, res: s2 } = makeReqRes('POST','/api/v1/cart', { id: 't1', name: 'Test' });
    r2.body = { id: 't1', name: 'Test' };
    await cartMod.default(r2, s2);
    console.log('/api/v1/cart POST ->', s2.__data);

    const { req: r3, res: s3 } = makeReqRes('GET','/api/v1/cart');
    await cartMod.default(r3, s3);
    console.log('/api/v1/cart GET ->', s3.__data);

  } catch (e) {
    console.error('invoke error', e);
  }
}
run();
