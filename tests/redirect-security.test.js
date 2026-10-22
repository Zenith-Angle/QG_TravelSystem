import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import followRedirects from 'follow-redirects';

test('cross-origin redirects strip credentials supplied as array headers', { timeout: 5000 }, async (t) => {
  const received = [];
  const server = http.createServer((req, res) => {
    received.push(req.headers);
    if (req.url === '/start') {
      // A different port is a different origin; keep both endpoints on loopback.
      res.writeHead(302, { Location: `http://127.0.0.1:${target.address().port}/end` });
      res.end();
    } else {
      res.end('unexpected');
    }
  });
  const target = http.createServer((req, res) => {
    res.end(JSON.stringify(req.headers));
  });
  for (const endpoint of [server, target]) {
    t.after(() => new Promise((resolve, reject) => {
      endpoint.close((error) => error ? reject(error) : resolve());
      endpoint.closeAllConnections();
    }));
    endpoint.listen(0, '127.0.0.1');
    await once(endpoint, 'listening');
  }

  const headers = await new Promise((resolve, reject) => {
    const request = followRedirects.http.get({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/start',
      headers: [
        'Host', `127.0.0.1:${server.address().port}`,
        'Authorization', 'Bearer test-only',
        'Cookie', 'session=test-only',
        'Proxy-Authorization', 'Basic test-only',
        'X-API-Key', 'test-only',
        'X-Public', 'preserved'
      ],
      sensitiveHeaders: ['X-API-Key']
    }, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('error', reject);
      response.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    });
    request.on('error', reject);
    request.setTimeout(2000, () => request.destroy(new Error('redirect request timed out')));
  });

  assert.equal(received.length, 1);
  for (const name of ['authorization', 'cookie', 'proxy-authorization', 'x-api-key']) {
    assert.ok(received[0][name], `${name} reaches the initial origin`);
    assert.equal(headers[name], undefined, `${name} must not reach the redirect target`);
  }
  assert.equal(headers['x-public'], 'preserved');
});
