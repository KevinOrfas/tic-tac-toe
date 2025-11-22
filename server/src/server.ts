import http from 'node:http';

export function createServer(): http.Server {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/v1/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}
