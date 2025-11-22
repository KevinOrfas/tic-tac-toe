import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { ResponseShape } from './operations/index.js';

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

  it('should return and array of finished games games with winners', async () => {
    const response = await fetch(`${baseUrl}/api/v1/games`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual([
      { id: '1', winner: 'Player 1', timeSpent: '', gameName: 'Sal' },
      { id: '2', winner: 'Player 2', timeSpent: '', gameName: 'Santiago' },
    ]);
  });

  it('should return list of games with winners', async () => {
    const response = await fetch(`${baseUrl}/api/v1/games`);
    expect(response.status).toBe(200);

    const data: ResponseShape[] = (await response.json()) as ResponseShape[];
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
});
