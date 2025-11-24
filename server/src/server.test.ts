import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Server } from 'node:http';
import { Game } from './types.js';
import { startTestServer, stopTestServer } from './test/testHelpers.js';
import { pool } from './db.js';
const { createServer } = await import('./server.js');

describe('HTTP Server', () => {
  let httpServer: Server;
  let baseUrl: string;

  beforeAll(async () => {
    httpServer = createServer();
    baseUrl = await startTestServer(httpServer);
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM games');
  });

  afterAll(async () => {
    await stopTestServer(httpServer);
  });

  it('should return health status', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  it('should return empty array when no games exist', async () => {
    const response = await fetch(`${baseUrl}/api/v1/games`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('should return list of games with winners', async () => {
    await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: 'Sal' }),
    });
    await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: 'Santiago' }),
    });

    const response = await fetch(`${baseUrl}/api/v1/games`);
    expect(response.status).toBe(200);

    const data: Game[] = (await response.json()) as Game[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);

    const game = data[0];
    expect(game).toHaveProperty('id');
    expect(game).toHaveProperty('winner');
    expect(game).toHaveProperty('gameName');
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
