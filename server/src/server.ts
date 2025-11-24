import http from 'node:http';
import {
  handleCreateGameRoute,
  handleGamesRoute,
  handleGetGameRoute,
} from './routes/index.js';

export function createServer(): http.Server {
  return http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === '/api/v1/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.method === 'GET' && req.url === '/api/v1/games') {
      handleGamesRoute(req, res);
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/v1/games/')) {
      handleGetGameRoute(req, res);
      return;
    }

    if (req.method === 'POST' && req.url === '/api/v1/games') {
      handleCreateGameRoute(req, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}
