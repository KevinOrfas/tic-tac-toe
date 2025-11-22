import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { Game } from './types.js';

describe('HTTP Server', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const { createServer } = await import('./server.js');
    server = createServer();
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        const port =
          address && typeof address === 'object' ? address.port : 3001;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should return health status', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  it.skip('should return empty array when no games exist', async () => {
    const response = await fetch(`${baseUrl}/api/v1/games`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('should return list of games with winners', async () => {
    const response = await fetch(`${baseUrl}/api/v1/games`);
    expect(response.status).toBe(200);

    const data: Game[] = (await response.json()) as Game[];
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const game = data[0];
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('winner');
      expect(data).toEqual([
        { id: '1', winner: 'Player 1', timeSpent: '', gameName: 'Sal' },
        { id: '2', winner: 'Player 2', timeSpent: '', gameName: 'Santiago' },
      ]);
    }
  });

  describe('POST /api/v1/games', () => {
    it('should create a new game with valid data', async () => {
      const response = await fetch(`${baseUrl}/api/v1/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: 'Test Game' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('gameName', 'Test Game');
      expect(data).toHaveProperty('winner', '');
      expect(data).toHaveProperty('timeSpent', '');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers on GET requests', async () => {
      const response = await fetch(`${baseUrl}/api/v1/games`);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type'
      );
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await fetch(`${baseUrl}/api/v1/games`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type'
      );
    });

    it('should include CORS headers on 404 responses', async () => {
      const response = await fetch(`${baseUrl}/api/v1/nonexistent`);

      expect(response.status).toBe(404);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });
});
